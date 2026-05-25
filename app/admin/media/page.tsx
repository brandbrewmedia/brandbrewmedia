'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
// uploads use presigned URLs — browser sends directly to Vercel Blob
import { Upload, Trash2, X, Film, Youtube, Image, Plus, CheckCircle, Loader, AlertCircle } from 'lucide-react'

const VIDEO_CATS = ['Brand Work', 'Social Media', 'Video Production', 'Events', 'Behind the Scenes', 'Other']
const PHOTO_CATS = ['Branding', 'Social Media', 'SEO', 'Performance', 'Video', 'Content', 'Events', 'Other']

function getYoutubeId(url: string): string {
  return url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )?.[1] ?? ''
}

type VideoEntry = {
  id: string; name: string; category: string; type: 'upload' | 'youtube'
  url: string; youtubeId?: string; uploadedAt: string
}

type PhotoEntry = {
  id: string; name: string; category: string; tag: string
  client: string; desc: string; result: string; url: string; uploadedAt: string
}

export default function MediaPage() {
  const [section, setSection]       = useState<'videos' | 'photos'>('videos')

  // Video state
  const [videos, setVideos]         = useState<VideoEntry[]>([])
  const [videoTab, setVideoTab]     = useState<'upload' | 'youtube'>('upload')
  const [videoCat, setVideoCat]     = useState(VIDEO_CATS[0])
  const [videoName, setVideoName]   = useState('')
  const [ytUrl, setYtUrl]           = useState('')
  const videoRef                    = useRef<HTMLInputElement>(null)

  // Photo state
  const [photos, setPhotos]         = useState<PhotoEntry[]>([])
  const [photoCat, setPhotoCat]     = useState(PHOTO_CATS[0])
  const [photoName, setPhotoName]   = useState('')
  const [photoTag, setPhotoTag]     = useState('')
  const [photoClient, setPhotoClient] = useState('')
  const [photoDesc, setPhotoDesc]   = useState('')
  const [photoResult, setPhotoResult] = useState('')
  const photoRef                    = useRef<HTMLInputElement>(null)

  // Shared
  const [lightbox, setLightbox]     = useState<VideoEntry | PhotoEntry | null>(null)
  const [dragging, setDragging]     = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [uploading, setUploading]   = useState(false)
  const [progress, setProgress]     = useState('')

  const loadVideos = useCallback(async () => {
    const res = await fetch('/api/videos')
    if (res.ok) setVideos(await res.json())
  }, [])

  const loadPhotos = useCallback(async () => {
    const res = await fetch('/api/photos')
    if (res.ok) setPhotos(await res.json())
  }, [])

  useEffect(() => { loadVideos(); loadPhotos() }, [loadVideos, loadPhotos])

  const showSuccess = (msg: string) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 4000) }
  const showError   = (msg: string) => { setError(msg);   setSuccess('') }

  // ── Video upload (client-side, no size limit) ──
  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    let uploaded = 0
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('video/')) { showError(`"${file.name}" is not a video`); continue }
      try {
        setProgress(`Uploading ${file.name}…`)
        const tokenRes = await fetch(`/api/upload?filename=videos/${Date.now()}-${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`)
        if (!tokenRes.ok) throw new Error(await tokenRes.text())
        const { presignedUrl } = await tokenRes.json()
        const putRes = await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } })
        if (!putRes.ok) throw new Error('Upload to storage failed')
        const putData = await putRes.json().catch(() => ({}))
        const url = putData.url ?? presignedUrl.split('?')[0]
        await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'upload', name: videoName.trim() || file.name, url, category: videoCat }),
        })
        uploaded++; setVideoName('')
      } catch (e: unknown) { showError(`Failed: ${e instanceof Error ? e.message : 'Unknown error'}`) }
    }
    setUploading(false); setProgress('')
    if (uploaded > 0) { await loadVideos(); showSuccess(`${uploaded} video${uploaded > 1 ? 's' : ''} uploaded!`) }
    if (videoRef.current) videoRef.current.value = ''
  }

  const addYoutube = async () => {
    if (!ytUrl.trim()) { showError('Paste a YouTube URL first'); return }
    const id = getYoutubeId(ytUrl.trim())
    if (!id) { showError('Invalid YouTube link'); return }
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'youtube', name: videoName.trim() || 'YouTube Video', url: ytUrl.trim(), youtubeId: id, category: videoCat }),
    })
    setYtUrl(''); setVideoName(''); await loadVideos(); showSuccess('YouTube video added!')
  }

  const deleteVideo = async (v: VideoEntry) => {
    if (!confirm(`Delete "${v.name}"?`)) return
    await fetch('/api/videos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: v.id, url: v.url }) })
    await loadVideos(); showSuccess('Deleted.')
  }

  // ── Photo upload (client-side, no size limit) ──
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    let uploaded = 0
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { showError(`"${file.name}" is not an image`); continue }
      try {
        setProgress(`Uploading ${file.name}…`)
        const tokenRes = await fetch(`/api/upload?filename=photos/${Date.now()}-${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`)
        if (!tokenRes.ok) throw new Error(await tokenRes.text())
        const { presignedUrl } = await tokenRes.json()
        const putRes = await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } })
        if (!putRes.ok) throw new Error('Upload to storage failed')
        const putData = await putRes.json().catch(() => ({}))
        const url = putData.url ?? presignedUrl.split('?')[0]
        await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: photoName.trim() || file.name,
            url, category: photoCat,
            tag: photoTag.trim() || photoCat,
            client: photoClient.trim(),
            desc: photoDesc.trim(),
            result: photoResult.trim(),
          }),
        })
        uploaded++
        setPhotoName(''); setPhotoTag(''); setPhotoClient(''); setPhotoDesc(''); setPhotoResult('')
      } catch (e: unknown) { showError(`Failed: ${e instanceof Error ? e.message : 'Unknown error'}`) }
    }
    setUploading(false); setProgress('')
    if (uploaded > 0) { await loadPhotos(); showSuccess(`${uploaded} photo${uploaded > 1 ? 's' : ''} uploaded!`) }
    if (photoRef.current) photoRef.current.value = ''
  }

  const deletePhoto = async (p: PhotoEntry) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    await fetch('/api/photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, url: p.url }) })
    await loadPhotos(); showSuccess('Deleted.')
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Media Library</h1>
        <p className="font-montserrat text-sm text-gray-400 mt-1">Upload photos and videos — all visible on your live site instantly.</p>
      </div>

      {/* Section switcher */}
      <div className="flex gap-3 mb-8">
        {([['photos', '🖼  Photos', Image], ['videos', '🎬  Videos', Film]] as const).map(([s, label]) => (
          <button key={s} onClick={() => { setSection(s); setError(''); setSuccess('') }}
            className={`px-5 py-2.5 font-montserrat text-sm font-semibold rounded-lg border transition-all
                        ${section === s ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}>
            {label} ({s === 'photos' ? photos.length : videos.length})
          </button>
        ))}
      </div>

      {/* Alerts */}
      {success && <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-5 font-montserrat text-sm"><CheckCircle size={18} /> {success}</div>}
      {error   && <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-5 font-montserrat text-sm"><AlertCircle size={18} /> {error}</div>}

      {/* ── PHOTOS SECTION ── */}
      {section === 'photos' && (
        <>
          <div className="glass p-6 mb-8">
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-5">Upload Photo</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Title *</label>
                <input className="admin-input" placeholder="e.g. TechVista Rebrand" value={photoName} onChange={e => setPhotoName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category *</label>
                <select className="admin-input bg-brand-gray-mid" value={photoCat} onChange={e => setPhotoCat(e.target.value)}>
                  {PHOTO_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Tag (shown on card)</label>
                <input className="admin-input" placeholder="e.g. Branding" value={photoTag} onChange={e => setPhotoTag(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Client Name</label>
                <input className="admin-input" placeholder="e.g. TechVista Solutions" value={photoClient} onChange={e => setPhotoClient(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                <input className="admin-input" placeholder="Short description of the project" value={photoDesc} onChange={e => setPhotoDesc(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Result / Achievement</label>
                <input className="admin-input" placeholder="e.g. +240% brand recognition" value={photoResult} onChange={e => setPhotoResult(e.target.value)} />
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
                          ${dragging ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-brand-red/60'}`}
              onClick={() => !uploading && photoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handlePhotoUpload(e.dataTransfer.files) }}
            >
              {uploading ? (
                <><Loader size={36} className="text-brand-red mx-auto mb-3 animate-spin" /><p className="font-montserrat text-sm text-white font-semibold">{progress}</p></>
              ) : (
                <><Upload size={36} className="text-brand-red mx-auto mb-3" /><p className="font-montserrat text-sm text-gray-200 font-semibold">Drop photo here or click to browse</p><p className="font-montserrat text-xs text-gray-500 mt-1">JPG, PNG, WebP — multiple files OK</p></>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
          </div>

          {photos.length === 0 ? (
            <div className="glass p-16 text-center"><p className="font-montserrat text-gray-500 text-sm">No photos yet — upload one above.</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map(p => (
                <div key={p.id} className="group relative glass overflow-hidden aspect-square cursor-pointer hover:border-brand-red/40 transition-all"
                  onClick={() => setLightbox(p)}>
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <p className="font-montserrat text-xs text-white text-center line-clamp-2">{p.name}</p>
                    <span className="font-montserrat text-xs text-brand-red uppercase">{p.category}</span>
                    <button onClick={e => { e.stopPropagation(); deletePhoto(p) }} className="mt-1 bg-red-600/90 hover:bg-red-600 p-2 rounded-full text-white"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── VIDEOS SECTION ── */}
      {section === 'videos' && (
        <>
          <div className="glass p-6 mb-8">
            <div className="flex gap-2 mb-5">
              {([['upload', '🎬  Upload File'], ['youtube', '▶️  YouTube Link']] as const).map(([t, label]) => (
                <button key={t} onClick={() => { setVideoTab(t); setError(''); setSuccess('') }}
                  className={`px-4 py-2 font-montserrat text-sm font-semibold rounded-lg border transition-all
                              ${videoTab === t ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Title</label>
                <input className="admin-input" placeholder="e.g. Brand Reel 2024" value={videoName} onChange={e => setVideoName(e.target.value)} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={videoCat} onChange={e => setVideoCat(e.target.value)}>
                  {VIDEO_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {videoTab === 'upload' && (
              <div className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                              ${dragging ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-brand-red/60'}`}
                onClick={() => !uploading && videoRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleVideoUpload(e.dataTransfer.files) }}>
                {uploading ? (
                  <><Loader size={36} className="text-brand-red mx-auto mb-3 animate-spin" /><p className="font-montserrat text-sm text-white">{progress}</p></>
                ) : (
                  <><Film size={36} className="text-brand-red mx-auto mb-3" /><p className="font-montserrat text-sm text-gray-200 font-semibold">Drop video here or click to browse</p><p className="font-montserrat text-xs text-gray-500 mt-1">MP4, MOV, WebM — any size</p></>
                )}
              </div>
            )}
            <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={e => handleVideoUpload(e.target.files)} />

            {videoTab === 'youtube' && (
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">YouTube URL</label>
                <div className="flex gap-3">
                  <input type="url" className="admin-input flex-1" placeholder="https://www.youtube.com/watch?v=..."
                    value={ytUrl} onChange={e => setYtUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addYoutube()} />
                  <button onClick={addYoutube} className="flex items-center gap-2 bg-brand-red text-white px-5 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-dark transition-colors rounded-lg whitespace-nowrap">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {videos.length === 0 ? (
            <div className="glass p-16 text-center"><p className="font-montserrat text-gray-500 text-sm">No videos yet.</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videos.map(v => (
                <div key={v.id} className="group relative glass overflow-hidden aspect-video cursor-pointer hover:border-brand-red/40 transition-all"
                  onClick={() => setLightbox(v)}>
                  {v.type === 'youtube' ? (
                    <img src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 p-2">
                      <Film size={28} className="text-brand-red" />
                      <span className="font-montserrat text-xs text-gray-300 text-center line-clamp-2">{v.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <p className="font-montserrat text-xs text-white text-center line-clamp-2">{v.name}</p>
                    <button onClick={e => { e.stopPropagation(); deleteVideo(v) }} className="mt-1 bg-red-600/90 hover:bg-red-600 p-2 rounded-full text-white"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 w-12 h-12 bg-white/10 hover:bg-brand-red flex items-center justify-center text-white transition-colors rounded-lg" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {'youtubeId' in lightbox && lightbox.type === 'youtube' ? (
              <div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${lightbox.youtubeId}?autoplay=1&rel=0`} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen /></div>
            ) : 'type' in lightbox && lightbox.type === 'upload' ? (
              <video src={lightbox.url} controls autoPlay className="w-full max-h-[80vh] rounded-lg" />
            ) : (
              <img src={lightbox.url} alt={lightbox.name} className="w-full max-h-[80vh] object-contain rounded-lg" />
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
