'use client'
import { useState, useRef, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

type PortfolioItem = {
  id: number
  title: string
  category: string
  desc: string
  result: string
  color: string
  tag: string
}

const PORTFOLIO: PortfolioItem[] = [
  {
    id: 1,
    title: 'TechVista Rebrand',
    category: 'Branding',
    desc: 'Complete brand identity overhaul for a B2B SaaS company — logo, guidelines, website, and launch campaign.',
    result: '+240% brand recognition',
    color: 'from-orange-900/40 to-brand-red/20',
    tag: 'Branding',
  },
  {
    id: 2,
    title: 'CloudNine Social Campaign',
    category: 'Social Media',
    desc: 'Six-month integrated social media strategy across Instagram, Facebook and LinkedIn for a D2C fashion brand.',
    result: '50K new followers, 3x ROAS',
    color: 'from-purple-900/40 to-brand-red/10',
    tag: 'SMM',
  },
  {
    id: 3,
    title: 'Spice Route SEO Domination',
    category: 'SEO',
    desc: 'Comprehensive SEO overhaul ranking 120+ keywords on page 1, driving 4x organic traffic in 6 months.',
    result: '400% organic traffic growth',
    color: 'from-emerald-900/40 to-brand-red/10',
    tag: 'SEO',
  },
  {
    id: 4,
    title: 'Stellar Homes PPC',
    category: 'Performance',
    desc: 'Google & Meta ad campaigns for a real estate developer generating high-quality leads at record-low CPL.',
    result: '₹12 CPL, 8x ROAS',
    color: 'from-blue-900/40 to-brand-red/10',
    tag: 'PPC',
  },
  {
    id: 5,
    title: 'FreshBite Brand Film',
    category: 'Video',
    desc: '3-minute brand film production for a healthy food brand — conceptualisation, shoot, and full post-production.',
    result: '2M views in 30 days',
    color: 'from-yellow-900/40 to-brand-red/10',
    tag: 'Video',
  },
  {
    id: 6,
    title: 'EduEdge Content Strategy',
    category: 'Content',
    desc: 'Full content strategy, blog production, and thought leadership pieces positioning the brand as an industry authority.',
    result: '180% increase in leads',
    color: 'from-red-900/40 to-brand-red/20',
    tag: 'Content',
  },
]

const CATEGORIES = ['All', 'Branding', 'Social Media', 'SEO', 'Performance', 'Video', 'Content']

function PortfolioCard({ item, idx }: { item: PortfolioItem; idx: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${idx * 80}ms` }}
      className={`group relative overflow-hidden bg-brand-gray-dark border border-white/5
                  hover:border-brand-red/30 transition-all duration-500 cursor-pointer
                  ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between mb-8">
          <span className="font-bebas text-xs tracking-widest text-brand-red bg-brand-red/10 px-3 py-1">
            {item.tag}
          </span>
          <ExternalLink
            size={16}
            className="text-white/0 group-hover:text-white/60 transition-colors duration-300"
          />
        </div>

        {/* Number */}
        <div className="font-bebas text-7xl text-white/5 group-hover:text-white/10 transition-all duration-500 leading-none mb-4 select-none">
          {String(item.id).padStart(2, '0')}
        </div>

        <h3 className="font-bebas text-3xl text-white tracking-wide mb-3 group-hover:text-brand-red transition-colors duration-300">
          {item.title}
        </h3>
        <p className="font-montserrat text-sm text-gray-400 leading-relaxed mb-6">{item.desc}</p>

        <div className="flex items-center gap-2">
          <span className="w-4 h-px bg-brand-red" />
          <span className="font-montserrat text-xs font-semibold text-brand-red uppercase tracking-widest">
            {item.result}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Portfolio() {
  const [active, setActive] = useState('All')
  const filtered =
    active === 'All' ? PORTFOLIO : PORTFOLIO.filter(p => p.category === active)

  return (
    <section id="portfolio" className="py-28 bg-brand-gray-dark relative">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-semibold tracking-[0.4em] text-brand-red uppercase block mb-4">
            Our Work
          </span>
          <h2 className="section-title mb-6">
            Results We&apos;ve <span className="text-brand-red">Brewed</span>
          </h2>
          <p className="font-montserrat text-gray-400 text-lg max-w-2xl mx-auto">
            Real campaigns. Real results. A snapshot of the brands we&apos;ve helped grow.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-montserrat text-xs font-semibold px-5 py-2 uppercase tracking-widest
                          transition-all duration-200 border
                          ${
                            active === cat
                              ? 'bg-brand-red text-white border-brand-red'
                              : 'text-gray-400 border-white/10 hover:border-brand-red hover:text-brand-red'
                          }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <PortfolioCard key={item.id} item={item} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
