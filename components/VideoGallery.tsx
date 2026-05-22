'use client'
import { useState, useEffect } from 'react'
import { Play, X, Youtube } from 'lucide-react'
import { media, type MediaItem } from '@/lib/storage'

// Default showcase videos — replace YouTube IDs with your own
const DEFAULT_VIDEOS: MediaItem[] = [
  {
    id: 'default-1',
    type: 'youtube',
    name: 'How to Build a Brand in 2024',
    youtubeId: 'XPJJcEpCpxc',
    url: 'https://www.youtube.com/watch?v=XPJJcEpCpxc',
    category: 'Branding',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    type: 'youtube',
    name: 'Social Media Marketing Strategy',
    youtubeId: 'q9gGBHFkCNQ',
    url: 'https://www.youtube.com/watch?v=q9gGBHFkCNQ',
    category: 'Social Media',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    type: 'youtube',
    name: 'SEO Tips That Actually Work',
    youtubeId: 'YB8ZRHNoYVE',
    url: 'https://www.youtube.com/watch?v=YB8ZRHNoYVE',
    category: 'SEO',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-4',
    type: 'youtube',
    name: 'Content Marketing Masterclass',
    youtubeId: 'Z3KDNx8ZX1o',
    url: 'https://www.youtube.com/watch?v=Z3KDNx8ZX1o',
    category: 'Content',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-5',
    type: 'youtube',
    name: 'Performance Ads That Convert',
    youtubeId: 'jMwjfXWrNF0',
    url: 'https://www.youtube.com/watch?v=jMwjfXWrNF0',
    category: 'Ads',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-6',
    type: 'youtube',
    name: 'Video Marketing for Brands',
    youtubeId: 'GV3FMdMqFiA',
    url: 'https://www.youtube.com/watch?v=GV3FMdMqFiA',
    category: 'Video',
    uploadedAt: new Date().toISOString(),
  },
]

function getYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )
  return match?.[1] ?? ''
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    // Merge admin-uploaded videos with defaults
    const adminVideos = media.list().filter(m => m.type === 'youtube' || m.type === 'video')
    setVideos(adminVideos.length > 0 ? [...adminVideos, ...DEFAULT_VIDEOS] : DEFAULT_VIDEOS)
  }, [])

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))]
  const filtered = filter === 'All' ? videos : videos.filter(v => v.category === filter)

  const getThumb = (item: MediaItem) => {
    if (item.type === 'youtube') {
      const id = item.youtubeId || getYoutubeId(item.url)
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    }
    return item.thumbnail || ''
  }

  const getEmbedId = (item: MediaItem) =>
    item.youtubeId || getYoutubeId(item.url)

  return (
    <section id="videos" className="py-28 bg-brand-black relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-semibold tracking-[0.4em] text-brand-red uppercase block mb-4">
            Video Content
          </span>
          <h2 className="section-title mb-6">
            Stories We&apos;ve <span className="text-brand-red">Told</span>
          </h2>
          <p className="font-montserrat text-gray-400 text-lg max-w-2xl mx-auto">
            Watch how we bring brands to life through compelling video narratives.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-montserrat text-xs font-semibold px-5 py-2 uppercase tracking-widest
                          transition-all duration-200 border
                          ${filter === cat
                            ? 'bg-brand-red text-white border-brand-red'
                            : 'text-gray-400 border-white/10 hover:border-brand-red hover:text-brand-red'
                          }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video, i) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative cursor-pointer overflow-hidden bg-brand-gray-dark border border-white/5
                         hover:border-brand-red/30 transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-brand-gray-mid">
                {(video.type === 'youtube') && (
                  <img
                    src={getThumb(video)}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=60'
                    }}
                  />
                )}
                {video.type === 'video' && (
                  <div className="w-full h-full flex items-center justify-center bg-brand-gray-mid">
                    <Play size={40} className="text-brand-red" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-brand-red/90 group-hover:bg-brand-red flex items-center justify-center
                                  group-hover:scale-110 transition-all duration-300 shadow-xl shadow-brand-red/30">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* YouTube badge */}
                {video.type === 'youtube' && (
                  <div className="absolute top-3 right-3 bg-black/70 p-1.5">
                    <Youtube size={14} className="text-red-500" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <span className="font-montserrat text-xs text-brand-red uppercase tracking-widest font-semibold">
                  {video.category}
                </span>
                <h3 className="font-bebas text-xl text-white tracking-wide mt-1 group-hover:text-brand-red transition-colors duration-300">
                  {video.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Admin hint */}
        <p className="text-center font-montserrat text-xs text-gray-600 mt-10">
          Add your own videos via{' '}
          <a href="/admin/media" className="text-brand-red hover:underline">Admin → Media Library</a>
        </p>
      </div>

      {/* Lightbox */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-brand-red flex items-center justify-center text-white transition-colors"
            onClick={() => setActiveVideo(null)}
          >
            <X size={20} />
          </button>

          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            {activeVideo.type === 'youtube' ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getEmbedId(activeVideo)}?autoplay=1&rel=0`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <video src={activeVideo.url} controls autoPlay className="w-full max-h-[80vh]" />
            )}
            <div className="mt-4 text-center">
              <h3 className="font-bebas text-2xl text-white tracking-wide">{activeVideo.name}</h3>
              <span className="font-montserrat text-xs text-brand-red uppercase tracking-widest">{activeVideo.category}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
