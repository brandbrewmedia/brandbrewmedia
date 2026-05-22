'use client'
import { useEffect, useRef, useState } from 'react'

const WORDS = ['Brands', 'Ideas', 'Stories', 'Futures', 'Dreams']

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % WORDS.length)
        setVisible(true)
      }, 400)
    }, 2500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-black"
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-red/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl animate-pulse-slow delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-3xl" />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(181,52,26,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(181,52,26,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="noise-overlay" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-8 opacity-0 animate-fade-in delay-100">
          <span className="w-8 h-px bg-brand-red" />
          <span className="font-montserrat text-xs font-semibold tracking-[0.4em] text-brand-red uppercase">
            Digital Marketing Agency
          </span>
          <span className="w-8 h-px bg-brand-red" />
        </div>

        {/* Main headline */}
        <h1 className="font-bebas text-[clamp(4rem,14vw,11rem)] leading-none text-white opacity-0 animate-fade-up delay-200 mb-2">
          We Brew
        </h1>

        {/* Animated word */}
        <div className="font-bebas text-[clamp(4rem,14vw,11rem)] leading-none overflow-hidden mb-6">
          <span
            className="inline-block text-gradient transition-all duration-400"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(-20px)',
            }}
          >
            {WORDS[wordIdx]}
          </span>
        </div>

        {/* Tagline */}
        <p className="font-montserrat text-lg md:text-xl text-gray-300 max-w-2xl mx-auto opacity-0 animate-fade-up delay-400 mb-12 leading-relaxed">
          From strategy to execution — we craft digital experiences that ignite growth,
          build authority, and turn audiences into brand advocates.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up delay-500">
          <a href="#contact" className="btn-primary group relative overflow-hidden">
            <span className="relative z-10">Start Your Journey</span>
            <span className="absolute inset-0 bg-brand-red-light translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </a>
          <a href="#portfolio" className="btn-outline">
            View Our Work
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto opacity-0 animate-fade-up delay-600">
          {[
            { num: '150+', label: 'Brands Brewed' },
            { num: '300%', label: 'Avg. Growth' },
            { num: '5★', label: 'Client Rating' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-bebas text-4xl md:text-5xl text-brand-red">{s.num}</div>
              <div className="font-montserrat text-xs text-gray-400 uppercase tracking-widest mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="font-montserrat text-xs tracking-widest text-gray-400 uppercase">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-brand-red to-transparent animate-pulse" />
      </div>

      {/* Marquee brand name at bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-3 border-t border-white/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(8).fill('BRAND BREW MEDIA · WE BREW BRANDS · ').map((t, i) => (
            <span key={i} className="font-bebas text-sm text-white/10 tracking-widest mx-4">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
