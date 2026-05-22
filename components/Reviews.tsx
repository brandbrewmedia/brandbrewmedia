'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { reviews as reviewsStorage, type Review } from '@/lib/storage'

export default function Reviews() {
  const [items, setItems] = useState<Review[]>([])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => { setItems(reviewsStorage.visible()) }, [])

  const go = useCallback((dir: 1 | -1) => {
    if (animating || items.length === 0) return
    setAnimating(true)
    setTimeout(() => { setCurrent(c => (c + dir + items.length) % items.length); setAnimating(false) }, 300)
  }, [animating, items.length])

  useEffect(() => {
    if (items.length === 0) return
    const t = setInterval(() => go(1), 5000)
    return () => clearInterval(t)
  }, [go, items.length])

  if (items.length === 0) return null
  const item = items[current]

  return (
    <section id="reviews" className="py-28 bg-brand-off-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-bold tracking-[0.4em] text-brand-red uppercase block mb-4">Testimonials</span>
          <h2 className="section-title mb-4">What Clients <span className="text-brand-red">Say</span></h2>
          <div className="flex justify-center"><span className="w-16 h-[3px] bg-brand-red" /></div>
        </div>

        <div className="bg-white border border-brand-gray-200 shadow-lg p-10 md:p-16 text-center relative">
          {/* Red accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-red" />

          <Quote size={48} className="text-brand-red/20 mx-auto mb-8" fill="currentColor" />

          <div className="transition-all duration-300" style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(10px)' : 'translateY(0)' }}>
            <div className="flex justify-center gap-1 mb-6">
              {Array(item.rating).fill(0).map((_, i) => (
                <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>

            <blockquote className="font-montserrat text-xl md:text-2xl text-black leading-relaxed mb-10 italic max-w-3xl mx-auto">
              &ldquo;{item.text}&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-brand-red flex items-center justify-center font-bebas text-xl text-white">
                {item.author.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-montserrat font-bold text-black">{item.author}</div>
                <div className="font-montserrat text-sm text-brand-gray-400">{item.company}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button onClick={() => go(-1)} className="w-12 h-12 border-2 border-brand-gray-200 hover:border-brand-red hover:bg-brand-red hover:text-white flex items-center justify-center transition-all duration-200 text-black">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button key={i} onClick={() => { if (!animating) setCurrent(i) }}
                  className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-brand-red' : 'w-2 h-2 bg-brand-gray-200 hover:bg-brand-gray-400'}`} />
              ))}
            </div>
            <button onClick={() => go(1)} className="w-12 h-12 border-2 border-brand-gray-200 hover:border-brand-red hover:bg-brand-red hover:text-white flex items-center justify-center transition-all duration-200 text-black">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
