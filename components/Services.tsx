'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, Share2, PenTool, Megaphone, Film, TrendingUp } from 'lucide-react'

const SERVICES = [
  { icon: Search,     title: 'Search Engine Optimisation', desc: 'Dominate Google rankings with data-driven SEO strategies — technical audits, content optimisation, and authoritative link building that drives qualified organic traffic.', tag: 'SEO' },
  { icon: Share2,     title: 'Social Media Marketing',     desc: 'Build an engaged community and amplify your brand voice across Instagram, Facebook, LinkedIn, and more with thumb-stopping content and strategic ad campaigns.', tag: 'SMM' },
  { icon: PenTool,    title: 'Brand Identity Design',      desc: 'From logo to full brand guidelines — we craft cohesive visual identities that instantly communicate your values and stay memorable.', tag: 'Branding' },
  { icon: Megaphone,  title: 'Performance Advertising',    desc: 'Maximise your ROI with precision-targeted Google, Meta, and programmatic ad campaigns. Every rupee tracked, every click optimised for maximum conversion.', tag: 'PPC' },
  { icon: PenTool,    title: 'Content Creation',           desc: 'Compelling copy, stunning visuals, and engaging video content that tells your story, educates your audience, and turns browsers into buyers.', tag: 'Content' },
  { icon: Film,       title: 'Video Production',           desc: 'Professional video content from concept to post-production — brand films, reels, product demos, and social stories that capture attention.', tag: 'Video' },
]

function ServiceCard({ service, index }: { service: (typeof SERVICES)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const Icon = service.icon

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group card-white p-8 cursor-default
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-brand-red/10 flex items-center justify-center group-hover:bg-brand-red transition-colors duration-300">
          <Icon size={24} className="text-brand-red group-hover:text-white transition-colors duration-300" />
        </div>
        <span className="font-montserrat text-xs font-bold tracking-widest text-brand-gray-400 uppercase group-hover:text-brand-red transition-colors">
          {service.tag}
        </span>
      </div>
      <h3 className="font-bebas text-2xl text-black tracking-wide mb-3 group-hover:text-brand-red transition-colors duration-300">
        {service.title}
      </h3>
      <p className="font-montserrat text-sm text-brand-gray-600 leading-relaxed">{service.desc}</p>
      <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-brand-red">
        <span className="font-montserrat text-xs font-bold uppercase tracking-widest">Learn More</span>
        <span>→</span>
      </div>
    </div>
  )
}

export default function Services() {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeaderVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="font-montserrat text-xs font-bold tracking-[0.4em] text-brand-red uppercase block mb-4">
            What We Do
          </span>
          <h2 className="section-title mb-4">
            Services That <span className="text-brand-red">Deliver</span>
          </h2>
          <div className="flex justify-center mb-6">
            <span className="w-16 h-[3px] bg-brand-red" />
          </div>
          <p className="font-montserrat text-brand-gray-600 text-lg max-w-2xl mx-auto">
            End-to-end digital marketing solutions engineered to grow your brand, reach, and revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => <ServiceCard key={s.title} service={s} index={i} />)}
        </div>
      </div>
    </section>
  )
}
