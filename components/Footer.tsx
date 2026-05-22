import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            {/* Logo in footer — inverted to show on dark background */}
            <div className="mb-5">
              <Image
                src="/logo.jpg"
                alt="Brand Brew Media — We Brew Brands"
                width={300}
                height={110}
                className="h-24 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="font-montserrat text-sm text-gray-400 leading-relaxed max-w-sm">
              We brew brands that resonate, inspire, and convert. Your growth partner for digital marketing,
              branding, and creative strategy in Chennai.
            </p>
          </div>

          <div>
            <h4 className="font-bebas text-lg text-white tracking-widest mb-4 relative inline-block">
              Services
              <span className="absolute -bottom-1 left-0 w-8 h-[2px] bg-brand-red" />
            </h4>
            <ul className="space-y-2 mt-3">
              {['SEO', 'Social Media', 'Brand Design', 'Performance Ads', 'Content', 'Video Production'].map(s => (
                <li key={s}>
                  <a href="#services" className="font-montserrat text-sm text-gray-400 hover:text-brand-red transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bebas text-lg text-white tracking-widest mb-4 relative inline-block">
              Contact
              <span className="absolute -bottom-1 left-0 w-8 h-[2px] bg-brand-red" />
            </h4>
            <ul className="space-y-3 mt-3">
              <li className="font-montserrat text-sm text-gray-400">brandbrewchennai@gmail.com</li>
              <li className="font-montserrat text-sm text-gray-400">+91 93810 06485</li>
              <li className="font-montserrat text-sm text-gray-400 leading-relaxed">
                1/2A, Mount Poonamallee Rd,<br />Ramapuram, Chennai – 600089
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-montserrat text-xs text-gray-600">
            © {new Date().getFullYear()} Brand Brew Media. All rights reserved.
          </p>
          <Link href="/admin" className="font-montserrat text-xs text-gray-700 hover:text-brand-red transition-colors uppercase tracking-widest">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}
