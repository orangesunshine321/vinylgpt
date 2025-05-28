// pages/index.tsx
import { useState, useEffect, ChangeEvent } from 'react'
import axios from 'axios'

interface Record {
  id: number
  artist: string
  title: string
  coverUrl: string | null
  aiVibe?: string | null
}

export default function Home() {
  const [records, setRecords] = useState<Record[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<Record[]>('/api/records')
        setRecords(data)
      } catch {
        setError('⚠️ Could not load records.')
      }
    })()
  }, [])

  const upload = async () => {
    if (!file) return
    setLoading(true); setError(null)
    const form = new FormData()
    form.append('image', file)
    try {
      await axios.post('/api/records/upload', form, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      setFile(null)
      const { data } = await axios.get<Record[]>('/api/records')
      setRecords(data)
    } catch {
      setError('⚠️ Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 font-mono bg-black text-green-400">
      <h1 className="text-5xl text-center mb-4">𝐕𝐈𝐍𝐘𝐋𝐆𝐏𝐓</h1>
      <p className="text-center mb-8">▉ Snap a cover, let the code rain ↓</p>

      <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            e.target.files && setFile(e.target.files[0])
          }
          className="file:border file:border-green-400 file:px-4 file:py-2 file:rounded hover:file:bg-green-900"
        />
        <button
          onClick={upload}
          disabled={!file || loading}
          className="px-6 py-2 border border-green-400 rounded hover:bg-green-900 disabled:opacity-50"
        >
          {loading ? '⏳ Uploading...' : '▶ Upload'}
        </button>
      </div>

      {error && <div className="text-center text-red-500 mb-6">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {records.length === 0 && !error ? (
          <div className="col-span-full text-center text-green-600">
            No records yet. Upload to start the flow.
          </div>
        ) : (
          records.map(r => (
            <div
              key={r.id}
              className="bg-gray-900 border border-green-700 rounded overflow-hidden shadow-lg"
            >
              {r.coverUrl ? (
                <img
                  src={r.coverUrl}
                  alt={`${r.artist} – ${r.title}`}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-green-900 flex items-center justify-center">
                  <span>No Cover</span>
                </div>
              )}
              <div className="p-4">
                <div className="font-bold">{r.artist}</div>
                <div className="italic mb-2">{r.title}</div>
                {r.aiVibe && (
                  <div className="text-sm text-green-300">
                    “{r.aiVibe}”
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
