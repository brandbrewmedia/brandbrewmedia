'use client'
import { useState, useRef, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'

type PortfolioItem = {
  id: number
  title: string
  category: string
  desc: string
  result: string
  tag: string
  image: string
  client: string
}

const PORTFOLIO: PortfolioItem[] = [
  {
    id: 1,
    title: 'TechVista Rebrand',
    category: 'Branding',
    tag: 'Branding',
    client: 'TechVista Solutions',
    desc: 'Complete brand identity overhaul for a B2B SaaS company — logo, guidelines, website, and launch campaign.',
    result: '+240% brand recognition',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  },
  {
    id: 2,
    title: 'CloudNine Social Campaign',
    category: 'Social Media',
    tag: 'SMM',
    client: 'CloudNine Retail',
    desc: 'Six-month integrated social media strategy across Instagram, Facebook and LinkedIn for a D2C fashion brand.',
    result: '50K new followers · 3x ROAS',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
  },
  {
    id: 3,
    title: 'Spice Route SEO',
    category: 'SEO',
    tag: 'SEO',
    client: 'Spice Route Foods',
    desc: 'Comprehensive SEO overhaul ranking 120+ keywords on page 1, driving 4x organic traffic in 6 months.',
    result: '400% organic traffic growth',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80',
  },
  {
    id: 4,
    title: 'Stellar Homes PPC',
    category: 'Performance',
    tag: 'PPC',
    client: 'Stellar Homes',
    desc: 'Google & Meta ad campaigns for a real estate developer generating high-quality leads at record-low CPL.',
    result: '₹12 CPL · 8x ROAS',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  },
  {
    id: 5,
    title: 'FreshBite Brand Film',
    category: 'Video',
    tag: 'Video',
    client: 'FreshBite',
    desc: '3-minute brand film production for a healthy food brand — conceptualisation, shoot, and full post-production.',
    result: '2M views in 30 days',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
  },
  {
    id: 6,
    title: 'EduEdge Content Strategy',
    category: 'Content',
    tag: 'Content',
    client: 'EduEdge',
    desc: 'Full content strategy, blog production, and thought leadership pieces positioning the brand as an authority.',
    result: '180% increase in leads',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
  },
]

const CATEGORIES = ['All', 'Branding', 'Social Media', 'SEO', 'Performance', 'Video', 'Content']

function PortfolioCard({ item, idx }: { item: PortfolioItem; idx: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        style={{ transitionDelay: `${idx * 80}ms` }}
        onClick={() => setModal(true)}
        className={`group card-white overflow-hidden cursor-pointer
                    ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-500`}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
          <span className="absolute top-4 left-4 font-montserrat text-xs font-bold tracking-widest text-white bg-brand-red px-3 py-1 uppercase">
            {item.tag}
          </span>
          <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink size={14} className="text-brand-red" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="font-montserrat text-xs text-brand-gray-400 uppercase tracking-widest mb-1">{item.client}</div>
          <h3 className="font-bebas text-2xl text-black tracking-wide mb-2 group-hover:text-brand-red transition-colors duration-300">
            {item.title}
          </h3>
          <p className="font-montserrat text-sm text-brand-gray-600 leading-relaxed line-clamp-2">{item.desc}</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-4 h-px bg-brand-red" />
            <span className="font-montserrat text-xs font-semibold text-brand-red uppercase tracking-widest">
              {item.result}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModal(false)}
        >
          <div
            className="bg-white border border-brand-gray-200 shadow-xl max-w-2xl w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-72">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <span className="absolute bottom-4 left-4 font-montserrat text-xs font-bold tracking-widest text-white bg-brand-red px-3 py-1 uppercase">
                {item.tag}
              </span>
            </div>
            <div className="p-8">
              <div className="font-montserrat text-xs text-brand-gray-400 uppercase tracking-widest mb-1">{item.client}</div>
              <h3 className="font-bebas text-4xl text-black tracking-wide mb-4">{item.title}</h3>
              <p className="font-montserrat text-sm text-brand-gray-600 leading-relaxed mb-6">{item.desc}</p>
              <div className="flex items-center gap-3 p-4 bg-brand-red/5 border border-brand-red/20">
                <span className="w-6 h-px bg-brand-red flex-shrink-0" />
                <span className="font-montserrat text-sm font-semibold text-brand-red uppercase tracking-widest">
                  Result: {item.result}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Portfolio() {
  const [active, setActive] = useState('All')
  const filtered =
    active === 'All' ? PORTFOLIO : PORTFOLIO.filter(p => p.category === active)

  return (
    <section id="portfolio" className="py-28 bg-brand-off-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-bold tracking-[0.4em] text-brand-red uppercase block mb-4">
            Our Work
          </span>
          <h2 className="section-title mb-4">
            Results We&apos;ve <span className="text-brand-red">Brewed</span>
          </h2>
          <div className="flex justify-center mb-6">
            <span className="w-16 h-[3px] bg-brand-red" />
          </div>
          <p className="font-montserrat text-brand-gray-600 text-lg max-w-2xl mx-auto">
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
                          ${active === cat
                            ? 'bg-brand-red text-white border-brand-red'
                            : 'text-brand-gray-600 border-brand-gray-200 hover:border-brand-red hover:text-brand-red bg-white'
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
