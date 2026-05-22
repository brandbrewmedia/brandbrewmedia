'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { media as store, type MediaItem } from '@/lib/storage'
import { saveVideoBlob, getVideoURL, deleteVideoBlob } from '@/lib/videoDB'
import { Upload, Trash2, X, Image, Film, Youtube, Plus, CheckCircle, Loader, AlertCircle } from 'lucide-react'

const CATEGORIES = ['Brand Work', 'Social Media', 'Video Production', 'Events', 'Behind the Scenes', 'Other']
const MAX_VIDEO_MB = 15
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024

function getYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )
  return match?.[1] ?? ''
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Compress image using Canvas before saving to localStorage
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = document.createElement('img')
      img.onload = () => {
        const MAX = 1200
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not supported')); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type VideoItem = MediaItem & { objectURL?: string }

export default function MediaPage() {
  const [items, setItems]             = useState<VideoItem[]>([])
  const [tab, setTab]                 = useState<'photo' | 'video' | 'youtube'>('photo')
  const [photoCategory, setPhotoCategory] = useState(CATEGORIES[0])
  const [videoCategory, setVideoCategory] = useState(CATEGORIES[0])
  const [ytCategory, setYtCategory]   = useState(CATEGORIES[0])
  const [name, setName]               = useState('')
  const [ytUrl, setYtUrl]             = useState('')
  const [lightbox, setLightbox]       = useState<VideoItem | null>(null)
  const [dragging, setDragging]       = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [uploading, setUploading]     = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'youtube'>('all')
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const loadItems = useCallback(async () => {
    const stored = store.list()
    const resolved = await Promise.all(
      stored.map(async m => {
        if (m.type === 'video' && m.url === 'indexed') {
          const url = await getVideoURL(m.id).catch(() => null)
          return { ...m, objectURL: url ?? undefined }
        }
        return m as VideoItem
      })
    )
    setItems(resolved)
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  const showSuccess = (msg: string) => {
    setSuccess(msg); setError('')
    setTimeout(() => setSuccess(''), 4000)
  }

  const showError = (msg: string) => {
    setError(msg); setSuccess('')
  }

  // ── Photo upload with compression ──────────────────────────
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)

    let uploaded = 0
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        showError(`"${file.name}" is not an image file`)
        continue
      }
      try {
        setUploadProgress(`Compressing ${file.name}…`)
        const compressed = await compressImage(file)
        store.add({ type: 'photo', name: file.name, url: compressed, category: photoCategory, size: file.size })
        uploaded++
      } catch {
        showError(`Failed to upload "${file.name}" — try a smaller image`)
      }
    }

    setUploading(false)
    setUploadProgress('')
    if (uploaded > 0) {
      showSuccess(`${uploaded} photo${uploaded > 1 ? 's' : ''} uploaded!`)
      await loadItems()
    }
    if (photoRef.current) photoRef.current.value = ''
  }

  // ── Video upload via IndexedDB ─────────────────────────────
  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return
    const file = files[0]
    setError('')

    if (!file.type.startsWith('video/')) {
      showError('Please select a video file (MP4, MOV, WebM)')
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      showError(`"${file.name}" is ${formatSize(file.size)} — must be under ${MAX_VIDEO_MB}MB. Try compressing it first.`)
      return
    }

    setUploading(true)
    setUploadProgress('Saving video to browser storage…')

    try {
      const item = store.add({
        type: 'video',
        name: name.trim() || file.name,
        url: 'indexed',
        category: videoCategory,
        size: file.size,
      })
      await saveVideoBlob(item.id, file)
      setName('')
      await loadItems()
      showSuccess(`Video "${item.name}" uploaded successfully!`)
    } catch (err: unknown) {
      // Remove the metadata entry since the blob save failed
      store.list().filter(m => m.url === 'indexed' && m.name === (name.trim() || file.name))
        .forEach(m => store.remove(m.id))
      const msg = err instanceof Error ? err.message : 'Unknown error'
      showError(`Upload failed: ${msg}. Try a smaller video or use YouTube link instead.`)
    } finally {
      setUploading(false)
      setUploadProgress('')
      if (videoRef.current) videoRef.current.value = ''
    }
  }

  // ── YouTube link ───────────────────────────────────────────
  const addYoutube = () => {
    setError('')
    if (!ytUrl.trim()) { showError('Paste a YouTube URL first'); return }
    const id = getYoutubeId(ytUrl.trim())
    if (!id) { showError('Invalid YouTube link — paste the full URL from the browser address bar'); return }
    const title = name.trim() || 'YouTube Video'
    store.add({
      type: 'youtube',
      name: title,
      url: ytUrl.trim(),
      youtubeId: id,
      category: ytCategory,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    })
    setYtUrl(''); setName('')
    loadItems()
    showSuccess(`"${title}" added to gallery!`)
  }

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async (item: VideoItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    if (item.type === 'video') await deleteVideoBlob(item.id).catch(() => {})
    store.remove(item.id)
    await loadItems()
    showSuccess('Deleted.')
  }

  const openLightbox = async (item: VideoItem) => {
    if (item.type === 'video' && !item.objectURL) {
      const url = await getVideoURL(item.id).catch(() => null)
      setLightbox({ ...item, objectURL: url ?? undefined })
    } else {
      setLightbox(item)
    }
  }

  const filtered = activeFilter === 'all' ? items : items.filter(m => m.type === activeFilter)

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Media Library</h1>
        <p className="font-montserrat text-sm text-gray-400 mt-1">
          Upload photos (auto-compressed), short videos up to {MAX_VIDEO_MB}MB, or add YouTube links.
        </p>
      </div>

      {/* Banners */}
      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-5 font-montserrat text-sm">
          <CheckCircle size={18} className="flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-5 font-montserrat text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload panel */}
      <div className="glass p-6 mb-8">
        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            ['photo',   '📷  Upload Photos',  Image],
            ['video',   `🎬  Short Video (≤${MAX_VIDEO_MB}MB)`, Film],
            ['youtube', '▶️  YouTube Link',   Youtube],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className={`px-4 py-2 font-montserrat text-sm font-semibold rounded-lg border transition-all
                          ${tab === t ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Photo tab ── */}
        {tab === 'photo' && (
          <div className="space-y-4">
            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
              <select className="admin-input bg-brand-gray-mid w-64" value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
                          ${dragging ? 'border-brand-red bg-brand-red/5 scale-[1.01]' : 'border-white/10 hover:border-brand-red/60 hover:bg-white/2'}`}
              onClick={() => !uploading && photoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handlePhotoUpload(e.dataTransfer.files) }}
            >
              {uploading ? (
                <>
                  <Loader size={36} className="text-brand-red mx-auto mb-3 animate-spin" />
                  <p className="font-montserrat text-sm text-white font-semibold">{uploadProgress}</p>
                  <p className="font-montserrat text-xs text-gray-500 mt-1">Please wait…</p>
                </>
              ) : (
                <>
                  <Upload size={36} className="text-brand-red mx-auto mb-3" />
                  <p className="font-montserrat text-sm text-gray-200 font-semibold">Drop photos here or click to browse</p>
                  <p className="font-montserrat text-xs text-gray-500 mt-1">JPG, PNG, WebP — multiple files OK — auto-compressed</p>
                </>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handlePhotoUpload(e.target.files)} />
          </div>
        )}

        {/* ── Video tab ── */}
        {tab === 'video' && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 font-montserrat text-xs text-yellow-400">
              💡 <strong>Tip:</strong> For best results on your live website, use the <strong>YouTube Link</strong> tab instead.
              Uploaded videos are stored only in <em>this browser</em> and won&apos;t show for other visitors.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Title</label>
                <input type="text" className="admin-input" placeholder="e.g. Brand reel 2024" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={videoCategory} onChange={e => setVideoCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div
              className="border-2 border-dashed border-white/10 hover:border-brand-red/50 rounded-lg p-12 text-center cursor-pointer transition-colors"
              onClick={() => !uploading && videoRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader size={36} className="text-brand-red mx-auto mb-3 animate-spin" />
                  <p className="font-montserrat text-sm text-white font-semibold">{uploadProgress}</p>
                  <p className="font-montserrat text-xs text-gray-500 mt-1">Please wait, do not close this page…</p>
                </>
              ) : (
                <>
                  <Film size={36} className="text-brand-red mx-auto mb-3" />
                  <p className="font-montserrat text-sm text-gray-200 font-semibold">Click to select a short video</p>
                  <p className="font-montserrat text-xs text-gray-500 mt-1">MP4, MOV, WebM — Max {MAX_VIDEO_MB}MB</p>
                </>
              )}
            </div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden"
              onChange={e => handleVideoUpload(e.target.files)} />
          </div>
        )}

        {/* ── YouTube tab ── */}
        {tab === 'youtube' && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 font-montserrat text-xs text-green-400">
              ✅ <strong>Recommended for live site.</strong> YouTube videos show for all visitors on every device.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Title</label>
                <input type="text" className="admin-input" placeholder="e.g. Our brand story" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={ytCategory} onChange={e => setYtCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">YouTube URL *</label>
              <div className="flex gap-3">
                <input type="url" className="admin-input flex-1"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={e => setYtUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addYoutube()}
                />
                <button onClick={addYoutube}
                  className="flex items-center gap-2 bg-brand-red text-white px-5 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg whitespace-nowrap">
                  <Plus size={16} /> Add Video
                </button>
              </div>
              <p className="font-montserrat text-xs text-gray-500 mt-1">
                Open YouTube → copy the link from the address bar → paste here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'photo', 'video', 'youtube'] as const).map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 text-xs font-montserrat font-semibold uppercase tracking-wide rounded-lg border transition-all capitalize
                        ${activeFilter === f ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}>
            {f} ({f === 'all' ? items.length : items.filter(m => m.type === f).length})
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="font-montserrat text-gray-500 text-sm">No media yet — upload photos or add a YouTube link above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id}
              className="group relative glass overflow-hidden aspect-square cursor-pointer hover:border-brand-red/40 transition-all">
              {item.type === 'photo' && (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" onClick={() => openLightbox(item)} />
              )}
              {item.type === 'video' && (
                <div className="w-full h-full bg-brand-gray-mid flex flex-col items-center justify-center gap-2 p-2" onClick={() => openLightbox(item)}>
                  <Film size={28} className="text-brand-red" />
                  <span className="font-montserrat text-xs text-gray-300 text-center line-clamp-2">{item.name}</span>
                  {item.size && <span className="font-montserrat text-xs text-gray-500">{formatSize(item.size)}</span>}
                </div>
              )}
              {item.type === 'youtube' && (
                <img src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                  alt={item.name} className="w-full h-full object-cover"
                  onClick={() => openLightbox(item)}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&q=60' }}
                />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="font-montserrat text-xs text-white text-center line-clamp-2">{item.name}</p>
                <span className="font-montserrat text-xs text-brand-red uppercase">{item.category}</span>
                <button onClick={e => { e.stopPropagation(); handleDelete(item) }}
                  className="mt-1 bg-red-600/90 hover:bg-red-600 p-2 rounded-full text-white transition-colors">
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
          <button className="absolute top-5 right-5 w-12 h-12 bg-white/10 hover:bg-brand-red flex items-center justify-center text-white transition-colors rounded-lg" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {lightbox.type === 'photo' && <img src={lightbox.url} alt={lightbox.name} className="w-full max-h-[80vh] object-contain rounded-lg" />}
            {lightbox.type === 'video' && lightbox.objectURL && <video src={lightbox.objectURL} controls autoPlay className="w-full max-h-[80vh] rounded-lg" />}
            {lightbox.type === 'video' && !lightbox.objectURL && (
              <div className="aspect-video flex items-center justify-center text-gray-400 font-montserrat text-sm glass rounded-lg">
                Video not available — it may have been cleared. Please re-upload.
              </div>
            )}
            {lightbox.type === 'youtube' && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe src={`https://www.youtube.com/embed/${lightbox.youtubeId}?autoplay=1&rel=0`}
                  className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
              </div>
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
