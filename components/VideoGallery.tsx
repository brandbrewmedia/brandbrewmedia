'use client'
import { useState, useEffect } from 'react'
import { Play, X, Youtube } from 'lucide-react'
import type { MediaItem } from '@/lib/storage'

const DEFAULT_VIDEOS: MediaItem[] = [
  { id: 'dv1', type: 'youtube', name: 'How to Build a Brand in 2024',     youtubeId: 'XPJJcEpCpxc', url: 'https://www.youtube.com/watch?v=XPJJcEpCpxc', category: 'Branding',     uploadedAt: '' },
  { id: 'dv2', type: 'youtube', name: 'Social Media Marketing Strategy',  youtubeId: 'q9gGBHFkCNQ', url: 'https://www.youtube.com/watch?v=q9gGBHFkCNQ', category: 'Social Media', uploadedAt: '' },
  { id: 'dv3', type: 'youtube', name: 'SEO Tips That Actually Work',       youtubeId: 'YB8ZRHNoYVE', url: 'https://www.youtube.com/watch?v=YB8ZRHNoYVE', category: 'SEO',          uploadedAt: '' },
  { id: 'dv4', type: 'youtube', name: 'Content Marketing Masterclass',    youtubeId: 'Z3KDNx8ZX1o', url: 'https://www.youtube.com/watch?v=Z3KDNx8ZX1o', category: 'Content',      uploadedAt: '' },
  { id: 'dv5', type: 'youtube', name: 'Performance Ads That Convert',     youtubeId: 'jMwjfXWrNF0', url: 'https://www.youtube.com/watch?v=jMwjfXWrNF0', category: 'Ads',          uploadedAt: '' },
  { id: 'dv6', type: 'youtube', name: 'Video Marketing for Brands',       youtubeId: 'GV3FMdMqFiA', url: 'https://www.youtube.com/watch?v=GV3FMdMqFiA', category: 'Video',        uploadedAt: '' },
]

function getYoutubeId(url: string) {
  return url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1] ?? ''
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [active, setActive] = useState<MediaItem | null>(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetch('/api/videos')
      .then(r => r.ok ? r.json() : [])
      .then((uploaded: MediaItem[]) => {
        setVideos(uploaded.length > 0 ? uploaded : DEFAULT_VIDEOS)
      })
      .catch(() => setVideos(DEFAULT_VIDEOS))
  }, [])

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))]
  const filtered = filter === 'All' ? videos : videos.filter(v => v.category === filter)

  return (
    <section id="videos" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-bold tracking-[0.4em] text-brand-red uppercase block mb-4">Video Content</span>
          <h2 className="section-title mb-4">Stories We&apos;ve <span className="text-brand-red">Told</span></h2>
          <div className="flex justify-center mb-6"><span className="w-16 h-[3px] bg-brand-red" /></div>
          <p className="font-montserrat text-brand-gray-600 text-lg max-w-2xl mx-auto">
            Watch how we bring brands to life through compelling video narratives.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`font-montserrat text-xs font-bold px-5 py-2 uppercase tracking-widest border-2 transition-all duration-200
                          ${filter === cat ? 'bg-brand-red text-white border-brand-red' : 'text-black border-black hover:border-brand-red hover:text-brand-red'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video, i) => (
            <div key={video.id} onClick={() => setActive(video)}
              className="group card-white overflow-hidden cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="relative aspect-video overflow-hidden bg-brand-gray-100">
                {video.type === 'youtube' && (
                  <img src={`https://img.youtube.com/vi/${video.youtubeId || getYoutubeId(video.url)}/hqdefault.jpg`}
                    alt={video.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=60' }} />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-brand-red group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-lg">
                    <Play size={22} className="text-white ml-1" fill="white" />
                  </div>
                </div>
                {video.type === 'youtube' && (
                  <div className="absolute top-3 right-3 bg-white/90 p-1.5"><Youtube size={14} className="text-brand-red" /></div>
                )}
              </div>
              <div className="p-5">
                <span className="font-montserrat text-xs font-bold text-brand-red uppercase tracking-widest">{video.category}</span>
                <h3 className="font-bebas text-xl text-black tracking-wide mt-1 group-hover:text-brand-red transition-colors duration-300">{video.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <button className="absolute top-5 right-5 w-12 h-12 bg-white/10 hover:bg-brand-red flex items-center justify-center text-white transition-colors" onClick={() => setActive(null)}>
            <X size={20} />
          </button>
          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            {active.type === 'youtube' && (
              <div className="aspect-video">
                <iframe src={`https://www.youtube.com/embed/${active.youtubeId || getYoutubeId(active.url)}?autoplay=1&rel=0`}
                  className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
              </div>
            )}
            {active.type === 'video' && <video src={active.url} controls autoPlay className="w-full max-h-[80vh]" />}
            <div className="mt-4 text-center">
              <h3 className="font-bebas text-2xl text-white tracking-wide">{active.name}</h3>
              <span className="font-montserrat text-xs text-brand-red uppercase tracking-widest">{active.category}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
