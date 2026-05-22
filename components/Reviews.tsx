'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { reviews as reviewsStorage, type Review } from '@/lib/storage'

export default function Reviews() {
  const [items, setItems] = useState<Review[]>([])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setItems(reviewsStorage.visible())
  }, [])

  const go = useCallback(
    (dir: 1 | -1) => {
      if (animating || items.length === 0) return
      setAnimating(true)
      setTimeout(() => {
        setCurrent(c => (c + dir + items.length) % items.length)
        setAnimating(false)
      }, 300)
    },
    [animating, items.length]
  )

  useEffect(() => {
    if (items.length === 0) return
    const t = setInterval(() => go(1), 5000)
    return () => clearInterval(t)
  }, [go, items.length])

  if (items.length === 0) return null

  const item = items[current]

  return (
    <section id="reviews" className="py-28 bg-brand-gray-dark relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-semibold tracking-[0.4em] text-brand-red uppercase block mb-4">
            Testimonials
          </span>
          <h2 className="section-title mb-6">
            What Clients <span className="text-brand-red">Say</span>
          </h2>
        </div>

        <div className="relative glass p-10 md:p-16 text-center">
          {/* Large quote icon */}
          <Quote
            size={64}
            className="text-brand-red/20 mx-auto mb-8"
            fill="currentColor"
          />

          {/* Review content */}
          <div
            className="transition-all duration-300"
            style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(10px)' : 'translateY(0)' }}
          >
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array(item.rating)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />
                ))}
            </div>

            <blockquote className="font-montserrat text-xl md:text-2xl text-white leading-relaxed mb-10 italic max-w-3xl mx-auto">
              &ldquo;{item.text}&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-brand-red flex items-center justify-center font-bebas text-xl text-white">
                {item.author.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-montserrat font-semibold text-white">{item.author}</div>
                <div className="font-montserrat text-sm text-gray-400">{item.company}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => go(-1)}
              className="w-12 h-12 border border-white/10 hover:border-brand-red hover:bg-brand-red
                         flex items-center justify-center transition-all duration-200 text-white"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (!animating) setCurrent(i) }}
                  className={`transition-all duration-300 rounded-full ${
                    i === current ? 'w-8 h-2 bg-brand-red' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-12 h-12 border border-white/10 hover:border-brand-red hover:bg-brand-red
                         flex items-center justify-center transition-all duration-200 text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
