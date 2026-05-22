'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Home',     href: '#hero' },
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#portfolio' },
  { label: 'Videos',   href: '#videos' },
  { label: 'Reviews',  href: '#reviews' },
  { label: 'Contact',  href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-md py-3 border-b border-gray-100'
          : 'bg-white/90 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="#hero" className="flex flex-col leading-none flex-shrink-0 group">
          {/* "BRAND BREW" — black, bold, wide */}
          <span className="logo-sparkle font-bebas text-xl sm:text-2xl text-black tracking-[0.12em] whitespace-nowrap group-hover:text-brand-red transition-colors duration-300">
            BRAND BREW
          </span>
          {/* "WE BREW BRANDS" — crimson, spaced caps with red underline */}
          <span className="font-montserrat text-[9px] sm:text-[10px] font-bold text-brand-red tracking-[0.45em] uppercase whitespace-nowrap relative">
            WE BREW BRANDS
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-red" />
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <ul className="hidden lg:flex items-center gap-5 xl:gap-7">
          {links.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-montserrat text-xs font-semibold text-gray-700
                           hover:text-brand-red transition-colors duration-200
                           uppercase tracking-wider whitespace-nowrap relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-red group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* ── CTA ── */}
        <div className="hidden lg:flex flex-shrink-0">
          <a href="#contact" className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap">
            Get Started
          </a>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-black p-2 flex-shrink-0 hover:text-brand-red transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-5 shadow-xl">
          <ul className="flex flex-col gap-1 mb-5">
            {links.map(l => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-montserrat text-sm font-semibold text-gray-700
                             hover:text-brand-red hover:bg-brand-gray-100
                             transition-all uppercase tracking-widest block py-3 px-3 rounded-lg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="btn-primary text-center block w-full"
          >
            Get Started
          </a>
        </div>
      )}
    </nav>
  )
}
