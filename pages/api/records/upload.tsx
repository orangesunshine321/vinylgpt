// pages/api/records/upload.tsx

import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs/promises';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import nextConnect, { NextConnect } from 'next-connect';
import { prisma } from '../../../lib/prisma';
import { findRelease } from '../../../lib/discogs';

export const config = { api: { bodyParser: false } };

// Multer will write uploads to /tmp/
const upload = multer({ dest: '/tmp/' });

// Google Vision client (uses GOOGLE_APPLICATION_CREDENTIALS)
const vision = new ImageAnnotatorClient();

// Create handler with correct typing
const handler: NextConnect<NextApiRequest, NextApiResponse> = nextConnect({
  onError(err, _req, res) {
    res.status(500).json({ error: err.message });
  }
});

handler.use(upload.single('image'));

handler.post(async (req: any, res: NextApiResponse) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // 1) OCR via Google Vision
    const [result] = await vision.textDetection(file.path);
    const rawText = result.fullTextAnnotation?.text?.trim() ?? '';
    const [artist, title] = rawText.split('–').map((s) => s.trim());

    // 2) Discogs lookup
    const release = await findRelease(artist, title);
    const coverUrl = release?.thumb ?? null;

    // 3) Insert into DB
    const record = await prisma.record.create({
      data: {
        artist,
        title,
        coverUrl,
        year: release?.year ?? null,
        genre: release?.genre?.[0] ?? null,
        discogsId: release?.id ?? null
      }
    });

    // 4) Optional AI “vibe”
    if (process.env.OPENAI_API_KEY) {
      const { OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const chat = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a vinyl record enthusiast.' },
          {
            role: 'user',
            content: `Describe the vibe of "${artist} – ${title}".`
          }
        ]
      });
      const aiVibe = chat.choices[0].message.content;
      await prisma.record.update({
        where: { id: record.id },
        data: { aiVibe }
      });
      record.aiVibe = aiVibe;
    }

    res.status(201).json(record);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
});

export default handler;
