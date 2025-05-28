// pages/api/records/upload.tsx

import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs/promises';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { prisma } from '../../../lib/prisma';
import { findRelease } from '../../../lib/discogs';

export const config = { api: { bodyParser: false } };

// Multer saves file to disk
const upload = multer({ dest: '/tmp/' });

// Instantiate the Vision client (picks up GOOGLE_APPLICATION_CREDENTIALS)
const vision = new ImageAnnotatorClient();

export default upload.single('image')(async (req: any, res: NextApiResponse) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const path = req.file.path;

    // 1) Run OCR
    const [result] = await vision.textDetection(path);
    const rawText = result.fullTextAnnotation?.text?.trim() ?? '';
    const [artist, title] = rawText.split('–').map((s) => s.trim());

    // 2) Query Discogs
    const release = await findRelease(artist, title);
    const coverUrl = release?.thumb ?? null;

    // 3) Save to DB
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

    // 4) (Optional) AI “vibe” from OpenAI
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
    // Remove temp file
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
});
