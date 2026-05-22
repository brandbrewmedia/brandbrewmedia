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
      setTimeout(() => { setWordIdx(i => (i + 1) % WORDS.length); setVisible(true) }, 400)
    }, 2500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-off-white"
      style={{ paddingTop: '80px' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Red accent blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-brand-red/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-8 opacity-0 animate-fade-in delay-100">
          <span className="w-8 h-[2px] bg-brand-red" />
          <span className="font-montserrat text-xs font-bold tracking-[0.45em] text-brand-red uppercase">
            Digital Marketing Agency
          </span>
          <span className="w-8 h-[2px] bg-brand-red" />
        </div>

        {/* Main headline */}
        <h1 className="font-bebas text-[clamp(4rem,13vw,10rem)] leading-none text-black opacity-0 animate-fade-up delay-200 mb-2 tracking-wider">
          We Brew
        </h1>

        {/* Animated cycling word */}
        <div className="font-bebas text-[clamp(4rem,13vw,10rem)] leading-none overflow-hidden mb-4 tracking-wider">
          <span
            className="inline-block text-brand-red transition-all duration-400"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(-20px)',
            }}
          >
            {WORDS[wordIdx]}
          </span>
        </div>

        {/* Red underline accent on tagline */}
        <div className="opacity-0 animate-fade-up delay-300 mb-6 flex justify-center">
          <span className="red-underline font-montserrat text-sm font-bold tracking-[0.4em] text-brand-red uppercase pb-2">
            We Brew Brands
          </span>
        </div>

        {/* Subtitle */}
        <p className="font-montserrat text-base md:text-lg text-brand-gray-600 max-w-2xl mx-auto opacity-0 animate-fade-up delay-400 mb-12 leading-relaxed">
          From strategy to execution — we craft digital experiences that ignite growth,
          build authority, and turn audiences into brand advocates.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up delay-500">
          <a href="#contact" className="btn-primary shadow-lg shadow-brand-red/20">
            Start Your Journey
          </a>
          <a href="#portfolio" className="btn-outline">
            View Our Work
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto opacity-0 animate-fade-up delay-600">
          {[
            { num: '150+', label: 'Brands Brewed' },
            { num: '300%', label: 'Avg. Growth' },
            { num: '5★',   label: 'Client Rating' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-bebas text-4xl md:text-5xl text-brand-red">{s.num}</div>
              <div className="font-montserrat text-xs text-brand-gray-400 uppercase tracking-widest mt-1 font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-montserrat text-xs tracking-widest text-brand-gray-400 uppercase font-semibold">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-brand-red to-transparent" />
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-3 border-t border-black/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(10).fill('BRAND BREW MEDIA · WE BREW BRANDS · ').map((t, i) => (
            <span key={i} className="font-bebas text-xs text-black/10 tracking-widest mx-4">{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
