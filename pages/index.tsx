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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await axios.get<Record[]>('/api/records')
      setRecords(res.data)
    } catch {
      setError('Failed to load your collection.')
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('image', file)
      await axios.post('/api/records/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFile(null)
      fetchRecords()
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">
        VinylGPT
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Snap or select a vinyl cover to add to your collection.
      </p>

      <div className="flex flex-col items-center mb-6 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="block w-full max-w-xs text-sm text-gray-500 dark:text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-100 file:text-blue-700
            hover:file:bg-blue-200"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {error && (
        <p className="text-center text-red-600 dark:text-red-400 mb-6">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {records.length === 0 && !error ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No records yet. Upload your first cover above!
          </p>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 shadow rounded overflow-hidden"
            >
              {r.coverUrl ? (
                <img
                  src={r.coverUrl}
                  alt={`${r.artist} – ${r.title}`}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    No Image
                  </span>
                </div>
              )}
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {r.artist}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {r.title}
                </p>
                {r.aiVibe && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {r.aiVibe}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
