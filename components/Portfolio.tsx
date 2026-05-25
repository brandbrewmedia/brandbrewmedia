'use client'
import { useState, useRef, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'

type PortfolioItem = {
  id: number | string
  title: string
  category: string
  desc: string
  result: string
  tag: string
  image: string
  client: string
}

const PORTFOLIO: PortfolioItem[] = []

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
  const [allItems, setAllItems] = useState<PortfolioItem[]>(PORTFOLIO)

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.ok ? r.json() : [])
      .then((uploaded: { id: string; name: string; category: string; tag: string; client: string; desc: string; result: string; url: string }[]) => {
        const mapped: PortfolioItem[] = uploaded.map(p => ({
          id: p.id, title: p.name, category: p.category,
          tag: p.tag || p.category, client: p.client || '',
          desc: p.desc || '', result: p.result || '', image: p.url,
        }))
        setAllItems(mapped)
      })
      .catch(() => {})
  }, [])

  const categories = ['All', ...Array.from(new Set(allItems.map(p => p.category)))]
  const filtered = active === 'All' ? allItems : allItems.filter(p => p.category === active)

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

        {/* ── Canva Presentation ── */}
        <div className="mb-16">
          <div className="relative w-full rounded-sm overflow-hidden shadow-lg border border-brand-gray-200"
               style={{ paddingTop: '56.25%' }}>
            <iframe
              loading="lazy"
              className="absolute inset-0 w-full h-full border-0"
              src="https://www.canva.com/design/DAG4951C_rU/U0_FB6AWzPcWo795T2TWMQ/view?embed"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
          <p className="text-center font-montserrat text-xs text-brand-gray-400 mt-3 tracking-widest uppercase">
            Our Brand Deck — powered by Canva
          </p>
        </div>

        {allItems.length > 0 && (
          <>
            {/* Filter tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map(cat => (
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
          </>
        )}
      </div>
    </section>
  )
}
