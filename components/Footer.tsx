import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-gray-dark border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-bebas text-3xl text-white tracking-widest">Brand Brew</span>
              <span className="font-bebas text-lg text-brand-red tracking-[0.4em] block">MEDIA</span>
            </div>
            <p className="font-montserrat text-sm text-gray-400 leading-relaxed max-w-sm">
              We brew brands that resonate, inspire, and convert. Your growth partner for digital marketing,
              branding, and creative strategy.
            </p>
          </div>

          <div>
            <h4 className="font-bebas text-lg text-white tracking-widest mb-4">Services</h4>
            <ul className="space-y-2">
              {['SEO', 'Social Media', 'Brand Design', 'Performance Ads', 'Content', 'Video Production'].map(s => (
                <li key={s}>
                  <a href="#services" className="font-montserrat text-sm text-gray-400 hover:text-brand-red transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bebas text-lg text-white tracking-widest mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Our Work', 'Careers', 'Blog', 'Contact'].map(s => (
                <li key={s}>
                  <a href="#" className="font-montserrat text-sm text-gray-400 hover:text-brand-red transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-montserrat text-xs text-gray-500">
            © {new Date().getFullYear()} Brand Brew Media. All rights reserved. — We Brew Brands
          </p>
          <Link
            href="/admin"
            className="font-montserrat text-xs text-gray-600 hover:text-brand-red transition-colors uppercase tracking-widest"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}
