'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { media as store, type MediaItem } from '@/lib/storage'
import { saveVideoBlob, getVideoURL, deleteVideoBlob } from '@/lib/videoDB'
import { Upload, Trash2, X, Image, Film, Youtube, Plus, CheckCircle, Loader } from 'lucide-react'

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

type VideoItem = MediaItem & { objectURL?: string }

export default function MediaPage() {
  const [items, setItems] = useState<VideoItem[]>([])
  const [tab, setTab] = useState<'photo' | 'video' | 'youtube'>('photo')
  const [photoCategory, setPhotoCategory] = useState(CATEGORIES[0])
  const [videoCategory, setVideoCategory] = useState(CATEGORIES[0])
  const [ytCategory, setYtCategory] = useState(CATEGORIES[0])
  const [name, setName] = useState('')
  const [ytUrl, setYtUrl] = useState('')
  const [lightbox, setLightbox] = useState<VideoItem | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'youtube'>('all')
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const loadItems = useCallback(async () => {
    const stored = store.list()
    // Resolve object URLs for local videos from IndexedDB
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
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  // ── Photo upload ──────────────────────────────────────────────
  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    setError('')
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return }
      const reader = new FileReader()
      reader.onload = e => {
        store.add({ type: 'photo', name: file.name, url: e.target?.result as string, category: photoCategory, size: file.size })
        loadItems()
        showSuccess(`Photo "${file.name}" uploaded!`)
      }
      reader.readAsDataURL(file)
    })
  }

  // ── Video upload via IndexedDB ────────────────────────────────
  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return
    const file = files[0]
    setError('')

    if (!file.type.startsWith('video/')) {
      setError('Only video files allowed (MP4, MOV, WebM)')
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`Video is ${formatSize(file.size)} — must be under ${MAX_VIDEO_MB}MB`)
      return
    }

    setUploading(true)
    try {
      // Save metadata to localStorage (url = 'indexed' means stored in IndexedDB)
      const item = store.add({
        type: 'video',
        name: name.trim() || file.name,
        url: 'indexed',
        category: videoCategory,
        size: file.size,
      })
      // Save the actual blob to IndexedDB
      await saveVideoBlob(item.id, file)
      setName('')
      await loadItems()
      showSuccess(`Video "${item.name}" uploaded successfully!`)
    } catch (err) {
      setError('Failed to save video. Please try a smaller file.')
      console.error(err)
    } finally {
      setUploading(false)
      if (videoRef.current) videoRef.current.value = ''
    }
  }

  // ── YouTube link ──────────────────────────────────────────────
  const addYoutube = () => {
    setError('')
    if (!ytUrl.trim()) { setError('Enter a YouTube URL'); return }
    const id = getYoutubeId(ytUrl)
    if (!id) { setError('Invalid YouTube URL — please paste the full link'); return }
    const title = name.trim() || 'YouTube Video'
    store.add({
      type: 'youtube',
      name: title,
      url: ytUrl.trim(),
      youtubeId: id,
      category: ytCategory,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    })
    setYtUrl('')
    setName('')
    loadItems()
    showSuccess(`"${title}" added!`)
  }

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (item: VideoItem) => {
    if (!confirm('Delete this media item?')) return
    if (item.type === 'video') await deleteVideoBlob(item.id).catch(() => {})
    store.remove(item.id)
    await loadItems()
  }

  const filtered = activeFilter === 'all' ? items : items.filter(m => m.type === activeFilter)

  const openLightbox = async (item: VideoItem) => {
    if (item.type === 'video' && !item.objectURL) {
      const url = await getVideoURL(item.id).catch(() => null)
      setLightbox({ ...item, objectURL: url ?? undefined })
    } else {
      setLightbox(item)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Media Library</h1>
        <p className="font-montserrat text-sm text-gray-400 mt-1">
          Upload photos, short videos (max {MAX_VIDEO_MB}MB), and YouTube links.
        </p>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4 font-montserrat text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red px-4 py-3 rounded-lg mb-4 font-montserrat text-sm">
          {error}
        </div>
      )}

      {/* Upload Panel */}
      <div className="glass p-6 mb-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            ['photo', 'Photo Upload', Image],
            ['video', `Short Video (≤${MAX_VIDEO_MB}MB)`, Film],
            ['youtube', 'YouTube Link', Youtube],
          ] as const).map(([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex items-center gap-2 px-4 py-2 font-montserrat text-sm font-semibold rounded-lg border transition-all
                          ${tab === t ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ── Photo Tab ── */}
        {tab === 'photo' && (
          <div className="space-y-4">
            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
              <select className="admin-input bg-brand-gray-mid w-64" value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200
                          ${dragging ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-brand-red/50'}`}
              onClick={() => photoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handlePhotoUpload(e.dataTransfer.files) }}
            >
              <Upload size={36} className="text-brand-red mx-auto mb-3" />
              <p className="font-montserrat text-sm text-gray-300 font-semibold">Drop photos here or click to browse</p>
              <p className="font-montserrat text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP — multiple files OK</p>
            </div>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { handlePhotoUpload(e.target.files); e.target.value = '' }} />
          </div>
        )}

        {/* ── Video Tab ── */}
        {tab === 'video' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Title</label>
                <input type="text" className="admin-input" placeholder="My reel / ad video" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={videoCategory} onChange={e => setVideoCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  <p className="font-montserrat text-sm text-gray-300 font-semibold">Saving video… please wait</p>
                </>
              ) : (
                <>
                  <Film size={36} className="text-brand-red mx-auto mb-3" />
                  <p className="font-montserrat text-sm text-gray-300 font-semibold">Click to select a short video</p>
                  <p className="font-montserrat text-xs text-gray-500 mt-1">MP4, MOV, WebM — Max {MAX_VIDEO_MB}MB</p>
                  <p className="font-montserrat text-xs text-gray-600 mt-1">Stored securely in your browser&apos;s local storage</p>
                </>
              )}
            </div>
            <input ref={videoRef} type="file" accept="video/mp4,video/mov,video/quicktime,video/webm" className="hidden"
              onChange={e => handleVideoUpload(e.target.files)} />
          </div>
        )}

        {/* ── YouTube Tab ── */}
        {tab === 'youtube' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Title</label>
                <input type="text" className="admin-input" placeholder="e.g. Brand story video" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={ytCategory} onChange={e => setYtCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">YouTube URL *</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  className="admin-input flex-1"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={e => setYtUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addYoutube()}
                />
                <button onClick={addYoutube}
                  className="flex items-center gap-2 bg-brand-red text-white px-5 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg whitespace-nowrap">
                  <Plus size={16} /> Add
                </button>
              </div>
              <p className="font-montserrat text-xs text-gray-600 mt-1">Paste any YouTube link — the video thumbnail will auto-load</p>
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

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="font-montserrat text-gray-500 text-sm">No media yet. Upload photos, videos or add YouTube links above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id}
              className="group relative glass overflow-hidden aspect-square cursor-pointer hover:border-brand-red/40 transition-all">

              {/* Thumbnail */}
              {item.type === 'photo' && (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" onClick={() => openLightbox(item)} />
              )}
              {item.type === 'video' && (
                <div className="w-full h-full bg-brand-gray-mid flex flex-col items-center justify-center gap-2" onClick={() => openLightbox(item)}>
                  <Film size={28} className="text-brand-red" />
                  <span className="font-montserrat text-xs text-gray-400 px-2 text-center line-clamp-2">{item.name}</span>
                  {item.size && <span className="font-montserrat text-xs text-gray-600">{formatSize(item.size)}</span>}
                </div>
              )}
              {item.type === 'youtube' && (
                <img
                  src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onClick={() => openLightbox(item)}
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="font-montserrat text-xs text-white text-center line-clamp-2 px-1">{item.name}</p>
                <span className="font-montserrat text-xs text-brand-red uppercase tracking-wide">{item.category}</span>
                <span className="font-montserrat text-xs text-gray-500 capitalize">{item.type}</span>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(item) }}
                  className="mt-1 bg-red-600/80 hover:bg-red-600 p-2 rounded-full text-white transition-colors"
                >
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
            {lightbox.type === 'photo' && (
              <img src={lightbox.url} alt={lightbox.name} className="w-full max-h-[80vh] object-contain rounded-lg" />
            )}
            {lightbox.type === 'video' && lightbox.objectURL && (
              <video src={lightbox.objectURL} controls autoPlay className="w-full max-h-[80vh] rounded-lg" />
            )}
            {lightbox.type === 'video' && !lightbox.objectURL && (
              <div className="aspect-video flex items-center justify-center text-gray-400 font-montserrat text-sm">
                Video not available — it may have been cleared from browser storage.
              </div>
            )}
            {lightbox.type === 'youtube' && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${lightbox.youtubeId}?autoplay=1&rel=0`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
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
