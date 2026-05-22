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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-black/95 backdrop-blur-lg shadow-lg shadow-black/50 py-3'
          : 'bg-gradient-to-b from-black/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="#hero" className="flex flex-col leading-none flex-shrink-0">
          <span className="font-bebas text-xl sm:text-2xl text-white tracking-widest whitespace-nowrap">
            Brand Brew
          </span>
          <span className="font-bebas text-[10px] sm:text-xs text-brand-red tracking-[0.35em] whitespace-nowrap">
            MEDIA
          </span>
        </Link>

        {/* Desktop Nav — only shown on large screens */}
        <ul className="hidden lg:flex items-center gap-5 xl:gap-8">
          {links.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-montserrat text-xs xl:text-sm font-medium text-gray-300
                           hover:text-brand-red transition-colors duration-200
                           uppercase tracking-wider whitespace-nowrap"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side actions */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/admin"
            className="font-montserrat text-xs text-gray-500 hover:text-brand-red
                       transition-colors uppercase tracking-widest whitespace-nowrap"
          >
            Admin
          </Link>
          <a
            href="#contact"
            className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap"
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-white p-2 flex-shrink-0"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="lg:hidden bg-brand-black border-t border-white/10 px-6 py-6 shadow-xl">
          <ul className="flex flex-col gap-1">
            {links.map(l => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-montserrat text-sm font-medium text-gray-300
                             hover:text-brand-red hover:bg-white/5 transition-all
                             uppercase tracking-widest block py-3 px-3 rounded-lg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="btn-primary text-center block"
            >
              Get Started
            </a>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="font-montserrat text-xs text-gray-500 hover:text-brand-red
                         transition-colors uppercase tracking-widest text-center py-2"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
