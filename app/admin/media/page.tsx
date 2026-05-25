'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Trash2, X, Film, Youtube, Plus, CheckCircle, Loader, AlertCircle } from 'lucide-react'

const CATEGORIES = ['Brand Work', 'Social Media', 'Video Production', 'Events', 'Behind the Scenes', 'Other']

function getYoutubeId(url: string): string {
  return url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )?.[1] ?? ''
}

type VideoEntry = {
  id: string
  name: string
  category: string
  type: 'upload' | 'youtube'
  url: string
  youtubeId?: string
  thumbnail?: string
  uploadedAt: string
}

export default function MediaPage() {
  const [items, setItems]         = useState<VideoEntry[]>([])
  const [tab, setTab]             = useState<'upload' | 'youtube'>('upload')
  const [category, setCategory]   = useState(CATEGORIES[0])
  const [name, setName]           = useState('')
  const [ytUrl, setYtUrl]         = useState('')
  const [lightbox, setLightbox]   = useState<VideoEntry | null>(null)
  const [dragging, setDragging]   = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/videos')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const showSuccess = (msg: string) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 4000) }
  const showError   = (msg: string) => { setError(msg);   setSuccess('') }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    let uploaded = 0

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('video/')) {
        showError(`"${file.name}" is not a video file`)
        continue
      }
      try {
        setProgress(`Uploading ${file.name}…`)
        const form = new FormData()
        form.append('file', file)
        form.append('folder', 'videos')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
        if (!uploadRes.ok) throw new Error(await uploadRes.text())
        const { url } = await uploadRes.json()

        await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'upload',
            name: name.trim() || file.name,
            url,
            category,
          }),
        })
        uploaded++
        setName('')
      } catch (err: unknown) {
        showError(`Failed to upload "${file.name}": ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    setUploading(false)
    setProgress('')
    if (uploaded > 0) {
      await load()
      showSuccess(`${uploaded} video${uploaded > 1 ? 's' : ''} uploaded successfully!`)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const addYoutube = async () => {
    setError('')
    if (!ytUrl.trim()) { showError('Paste a YouTube URL first'); return }
    const id = getYoutubeId(ytUrl.trim())
    if (!id) { showError('Invalid YouTube link — paste the full URL from your browser'); return }
    const title = name.trim() || 'YouTube Video'
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'youtube',
        name: title,
        url: ytUrl.trim(),
        youtubeId: id,
        category,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      }),
    })
    setYtUrl(''); setName('')
    await load()
    showSuccess(`"${title}" added!`)
  }

  const handleDelete = async (item: VideoEntry) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    await fetch('/api/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, url: item.url }),
    })
    await load()
    showSuccess('Deleted.')
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Media Library</h1>
        <p className="font-montserrat text-sm text-gray-400 mt-1">
          Upload videos directly or add YouTube links — all visible on your live site instantly.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-5 font-montserrat text-sm">
          <CheckCircle size={18} className="flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-5 font-montserrat text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Upload panel */}
      <div className="glass p-6 mb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([['upload', '🎬  Upload Video File', Film], ['youtube', '▶️  YouTube Link', Youtube]] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className={`px-4 py-2 font-montserrat text-sm font-semibold rounded-lg border transition-all
                          ${tab === t ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Shared fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Title</label>
            <input type="text" className="admin-input" placeholder="e.g. Brand Reel 2024"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
            <select className="admin-input bg-brand-gray-mid" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Upload tab */}
        {tab === 'upload' && (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
                        ${dragging ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-brand-red/60'}`}
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files) }}
          >
            {uploading ? (
              <>
                <Loader size={36} className="text-brand-red mx-auto mb-3 animate-spin" />
                <p className="font-montserrat text-sm text-white font-semibold">{progress}</p>
                <p className="font-montserrat text-xs text-gray-500 mt-1">Please wait, do not close this page…</p>
              </>
            ) : (
              <>
                <Upload size={36} className="text-brand-red mx-auto mb-3" />
                <p className="font-montserrat text-sm text-gray-200 font-semibold">Drop video here or click to browse</p>
                <p className="font-montserrat text-xs text-gray-500 mt-1">MP4, MOV, WebM — any size</p>
              </>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept="video/*" multiple className="hidden"
          onChange={e => handleUpload(e.target.files)} />

        {/* YouTube tab */}
        {tab === 'youtube' && (
          <div>
            <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">YouTube URL</label>
            <div className="flex gap-3">
              <input type="url" className="admin-input flex-1"
                placeholder="https://www.youtube.com/watch?v=..."
                value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addYoutube()} />
              <button onClick={addYoutube}
                className="flex items-center gap-2 bg-brand-red text-white px-5 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-dark transition-colors rounded-lg whitespace-nowrap">
                <Plus size={16} /> Add Video
              </button>
            </div>
            <p className="font-montserrat text-xs text-gray-500 mt-1">Copy the URL from YouTube and paste it here</p>
          </div>
        )}
      </div>

      {/* Gallery grid */}
      {items.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="font-montserrat text-gray-500 text-sm">No videos yet — upload a file or add a YouTube link above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id}
              className="group relative glass overflow-hidden aspect-video cursor-pointer hover:border-brand-red/40 transition-all"
              onClick={() => setLightbox(item)}>
              {item.type === 'youtube' ? (
                <img src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                  alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 p-2">
                  <Film size={28} className="text-brand-red" />
                  <span className="font-montserrat text-xs text-gray-300 text-center line-clamp-2">{item.name}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="font-montserrat text-xs text-white text-center line-clamp-2">{item.name}</p>
                <span className="font-montserrat text-xs text-brand-red uppercase">{item.category}</span>
                <button onClick={e => { e.stopPropagation(); handleDelete(item) }}
                  className="mt-1 bg-red-600/90 hover:bg-red-600 p-2 rounded-full text-white">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 w-12 h-12 bg-white/10 hover:bg-brand-red flex items-center justify-center text-white transition-colors rounded-lg"
            onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {lightbox.type === 'youtube' ? (
              <div className="aspect-video">
                <iframe src={`https://www.youtube.com/embed/${lightbox.youtubeId}?autoplay=1&rel=0`}
                  className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
              </div>
            ) : (
              <video src={lightbox.url} controls autoPlay className="w-full max-h-[80vh] rounded-lg" />
            )}
            <div className="mt-3 text-center">
              <p className="font-bebas text-xl text-white tracking-wide">{lightbox.name}</p>
              <p className="font-montserrat text-xs text-brand-red uppercase tracking-widest">{lightbox.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
