// pages/api/records/upload.tsx

import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect = require('next-connect');
import multer from 'multer';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { OpenAI } from 'openai';
import { prisma } from '../../../lib/prisma';
import { findRelease } from '../../../lib/discogs';

const upload = multer({ dest: './uploads/' });

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, _req, res) {
    res.status(500).json({ error: err.message });
  }
});

handler.use(upload.single('image'));

handler.post(async (req: any, res: NextApiResponse) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // 1) OCR via Tesseract.js
  const worker = await createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const {
    data: { text: rawText }
  } = await worker.recognize(file.path);
  await worker.terminate();

  const text = rawText.trim();
  const [artist, title] = text.split('–').map((s) => s.trim());

  // 2) Discogs lookup
  const release = await findRelease(artist, title);
  const coverUrl = release?.thumb ?? null;

  // 3) Insert into SQLite
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

  // 4) (Optional) AI-generated “vibe”
  let aiVibe: string | null = null;
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a vinyl record enthusiast.' },
        {
          role: 'user',
          content: `Describe the vibe of the record "${artist} – ${title}".`
        }
      ]
    });
    aiVibe = chat.choices[0].message.content;
    await prisma.record.update({
      where: { id: record.id },
      data: { aiVibe }
    });
  }

  res.json({ ...record, aiVibe });
});

export const config = {
  api: { bodyParser: false }
};

export default handler;
