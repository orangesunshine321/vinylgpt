// pages/index.tsx
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [records, setRecords] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)

  const fetchRecords = async () => {
    const res = await axios.get('/api/records')
    setRecords(res.data)
  }

  useEffect(() => { fetchRecords() }, [])

  const upload = async () => {
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    await axios.post('/api/records/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setFile(null)
    fetchRecords()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-center mb-6">VinylGPT</h1>

      <div className="flex justify-center mb-6">
        <input
          type="file"
          capture="environment"
          accept="image/*"
          onChange={e => e.target.files && setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <button
          onClick={upload}
          disabled={!file}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Upload
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {records.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden">
            <img
              src={r.coverUrl || '/placeholder.png'}
              alt={`${r.artist} – ${r.title}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-2">
              <h3 className="font-semibold">{r.artist} – {r.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
