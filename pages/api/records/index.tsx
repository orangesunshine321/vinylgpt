// pages/api/records/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { Parser } from 'json2csv'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const all = await prisma.record.findMany({ orderBy: { createdAt: 'desc' } })
    if (req.query.format === 'csv') {
      const csv = new Parser().parse(all)
      res.setHeader('Content-Type', 'text/csv')
      return res.send(csv)
    }
    return res.json(all)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
