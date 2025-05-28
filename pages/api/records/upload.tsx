// pages/api/records/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import multer from 'multer'
import fs from 'fs'
import { OpenAI } from 'openai'
import { prisma } from '../../../lib/prisma'
import { findRelease } from '../../../lib/discogs'

// store uploads under /uploads
const upload = multer({ dest: './uploads/' })

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, _req, res) {
    res.status(500).json({ error: err.message })
  }
})

handler.use(upload.single('image'))

handler.post(async (req: any, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'No file provided' })

  // 1) OCR via OpenAI Vision
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  const buffer = fs.readFileSync(file.path)
  const ocr = await openai.images.analyze({ model: 'vision-ocr', image: buffer })
  const text = ocr.ocr?.text?.trim() || ''
  const [artist, title] = text.split('–').map(s => s.trim())

  // 2) Discogs lookup
  const release = await findRelease(artist, title)
  const coverUrl = release?.thumb ?? null

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
  })

  res.json(record)
})

export const config = {
  api: { bodyParser: false }
}

export default handler
