'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Home', href: '#hero' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#portfolio' },
  { label: 'Videos', href: '#videos' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
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
        scrolled ? 'bg-brand-black/95 backdrop-blur-lg shadow-lg shadow-black/50 py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="#hero" className="flex flex-col leading-none">
          <span className="font-bebas text-2xl text-white tracking-widest">Brand Brew</span>
          <span className="font-bebas text-xs text-brand-red tracking-[0.4em]">MEDIA</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-montserrat text-sm font-medium text-gray-300 hover:text-brand-red
                           transition-colors duration-200 uppercase tracking-widest"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/admin"
            className="font-montserrat text-xs text-gray-500 hover:text-brand-red transition-colors uppercase tracking-widest"
          >
            Admin
          </Link>
          <a
            href="#contact"
            className="btn-primary text-xs px-6 py-3"
          >
            Get Started
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-black/98 border-t border-white/5 px-6 py-6">
          <ul className="flex flex-col gap-4">
            {links.map(l => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-montserrat text-sm font-medium text-gray-300 hover:text-brand-red
                             transition-colors uppercase tracking-widest block py-2"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="btn-primary inline-block text-center mt-2"
              >
                Get Started
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
