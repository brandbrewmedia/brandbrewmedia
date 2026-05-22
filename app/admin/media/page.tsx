'use client'
import { useState, useEffect, useRef } from 'react'
import { media as store, type MediaItem } from '@/lib/storage'
import { Upload, Link, Trash2, X, Image, Film, Youtube, Plus } from 'lucide-react'

const CATEGORIES = ['Brand Work', 'Social Media', 'Video Production', 'Events', 'Behind the Scenes', 'Other']
const MAX_VIDEO_MB = 15
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024

function getYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  return match?.[1] ?? ''
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [tab, setTab] = useState<'photo' | 'video' | 'youtube'>('photo')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [name, setName] = useState('')
  const [ytUrl, setYtUrl] = useState('')
  const [ytCategory, setYtCategory] = useState(CATEGORIES[0])
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'youtube'>('all')
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const load = () => setItems(store.list())
  useEffect(() => { load() }, [])

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    setError('')
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return }
      const reader = new FileReader()
      reader.onload = e => {
        store.add({ type: 'photo', name: file.name, url: e.target?.result as string, category, size: file.size })
        load()
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (files: FileList | null) => {
    if (!files) return
    setError('')
    const file = files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { setError('Only video files allowed'); return }
    if (file.size > MAX_VIDEO_BYTES) { setError(`Video must be under ${MAX_VIDEO_MB}MB`); return }
    const reader = new FileReader()
    reader.onload = e => {
      store.add({
        type: 'video',
        name: name || file.name,
        url: e.target?.result as string,
        category,
        size: file.size,
      })
      setName(''); load()
    }
    reader.readAsDataURL(file)
  }

  const addYoutube = () => {
    setError('')
    if (!ytUrl.trim()) { setError('Enter a YouTube URL'); return }
    const id = getYoutubeId(ytUrl)
    if (!id) { setError('Invalid YouTube URL'); return }
    store.add({
      type: 'youtube',
      name: name || `YouTube Video`,
      url: ytUrl,
      youtubeId: id,
      category: ytCategory,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    })
    setYtUrl(''); setName(''); load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this media item?')) { store.remove(id); load() }
  }

  const filtered = activeFilter === 'all' ? items : items.filter(m => m.type === activeFilter)

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Media Library</h1>
        <p className="font-montserrat text-sm text-gray-400 mt-1">Upload photos, short videos (max 15MB), and YouTube links.</p>
      </div>

      {/* Upload Panel */}
      <div className="glass p-6 mb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([['photo', 'Photo Upload', Image], ['video', 'Short Video', Film], ['youtube', 'YouTube Link', Youtube]] as const).map(([t, label, Icon]) => (
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

        {tab === 'photo' && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200
                          ${dragging ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-brand-red/50'}`}
              onClick={() => photoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handlePhotoUpload(e.dataTransfer.files) }}
            >
              <Upload size={32} className="text-brand-red mx-auto mb-3" />
              <p className="font-montserrat text-sm text-gray-300 font-semibold">Drop photos here or click to browse</p>
              <p className="font-montserrat text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP — multiple files OK</p>
            </div>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
          </div>
        )}

        {tab === 'video' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Name</label>
                <input type="text" className="admin-input" placeholder="My video" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div
              className="border-2 border-dashed border-white/10 hover:border-brand-red/50 rounded-lg p-10 text-center cursor-pointer transition-colors"
              onClick={() => videoRef.current?.click()}
            >
              <Film size={32} className="text-brand-red mx-auto mb-3" />
              <p className="font-montserrat text-sm text-gray-300 font-semibold">Click to upload short video</p>
              <p className="font-montserrat text-xs text-gray-500 mt-1">MP4, MOV, WebM — Max {MAX_VIDEO_MB}MB</p>
            </div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleVideoUpload(e.target.files)} />
          </div>
        )}

        {tab === 'youtube' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Video Title</label>
                <input type="text" className="admin-input" placeholder="Video title" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={ytCategory} onChange={e => setYtCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">YouTube URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  className="admin-input flex-1"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={e => setYtUrl(e.target.value)}
                />
                <button onClick={addYoutube} className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg whitespace-nowrap">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="font-montserrat text-xs text-brand-red mt-3 bg-brand-red/10 px-3 py-2 rounded-lg">{error}</p>}
      </div>

      {/* Filter + Gallery */}
      <div className="flex gap-2 mb-6">
        {(['all', 'photo', 'video', 'youtube'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-2 text-xs font-montserrat font-semibold uppercase tracking-wide rounded-lg border transition-all capitalize
                        ${activeFilter === f ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}
          >
            {f} {f === 'all' ? `(${items.length})` : `(${items.filter(m => m.type === f).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full glass p-12 text-center text-gray-500 font-montserrat text-sm">
            No media yet. Upload photos or add YouTube links above.
          </div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="group relative glass overflow-hidden aspect-square cursor-pointer hover:border-brand-red/30 transition-all">
            {item.type === 'photo' && (
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" onClick={() => setLightbox(item)} />
            )}
            {item.type === 'video' && (
              <div className="w-full h-full bg-brand-gray-mid flex items-center justify-center" onClick={() => setLightbox(item)}>
                <Film size={32} className="text-brand-red" />
              </div>
            )}
            {item.type === 'youtube' && (
              <img
                src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                alt={item.name}
                className="w-full h-full object-cover"
                onClick={() => setLightbox(item)}
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <p className="font-montserrat text-xs text-white text-center truncate w-full px-1">{item.name}</p>
              <span className="font-montserrat text-xs text-brand-red uppercase">{item.category}</span>
              <button onClick={() => handleDelete(item.id)} className="mt-2 bg-red-500/80 p-2 rounded-full text-white hover:bg-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-brand-red" onClick={() => setLightbox(null)}>
            <X size={32} />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {lightbox.type === 'photo' && <img src={lightbox.url} alt={lightbox.name} className="w-full max-h-[80vh] object-contain" />}
            {lightbox.type === 'video' && <video src={lightbox.url} controls autoPlay className="w-full max-h-[80vh]" />}
            {lightbox.type === 'youtube' && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${lightbox.youtubeId}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            )}
            <p className="font-montserrat text-sm text-gray-300 mt-3 text-center">{lightbox.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}
