'use client'
import { useState, useEffect } from 'react'
import { Play, X } from 'lucide-react'
import { media, type MediaItem } from '@/lib/storage'

const DEFAULT_VIDEOS = [
  {
    id: 'default-1',
    type: 'youtube' as const,
    name: 'Brand Strategy Masterclass',
    youtubeId: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Education',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    type: 'youtube' as const,
    name: 'Social Media Marketing Tips',
    youtubeId: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Tips',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    type: 'youtube' as const,
    name: 'SEO in 2024 — What Works',
    youtubeId: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'SEO',
    uploadedAt: new Date().toISOString(),
  },
]

function getYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  return match?.[1] ?? ''
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null)

  useEffect(() => {
    const stored = media.list().filter(m => m.type === 'youtube' || m.type === 'video')
    setVideos(stored.length > 0 ? stored : DEFAULT_VIDEOS)
  }, [])

  const getThumb = (item: MediaItem) => {
    if (item.type === 'youtube') {
      const id = item.youtubeId || getYoutubeId(item.url)
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    }
    return item.thumbnail || ''
  }

  return (
    <section id="videos" className="py-28 bg-brand-black relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative cursor-pointer overflow-hidden bg-brand-gray-dark border border-white/5
                         hover:border-brand-red/30 transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                {video.type === 'youtube' ? (
                  <img
                    src={getThumb(video)}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-gray-mid flex items-center justify-center">
                    <Play size={40} className="text-brand-red" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/20 transition-colors duration-300" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-brand-red/90 group-hover:bg-brand-red flex items-center justify-center
                                  group-hover:scale-110 transition-all duration-300 shadow-lg shadow-brand-red/40">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>

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
      </div>

      {/* Lightbox */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-brand-red transition-colors"
            onClick={() => setActiveVideo(null)}
          >
            <X size={32} />
          </button>

          <div
            className="w-full max-w-5xl aspect-video"
            onClick={e => e.stopPropagation()}
          >
            {activeVideo.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId || getYoutubeId(activeVideo.url)}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video src={activeVideo.url} controls autoPlay className="w-full h-full" />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
