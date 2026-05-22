import type { Metadata } from 'next'
import { Bebas_Neue, Montserrat } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Brand Brew Media — We Brew Brands',
  description:
    'Brand Brew Media is a full-service digital marketing agency specializing in brand strategy, social media, SEO, content creation, and more.',
  keywords: 'digital marketing, branding, SEO, social media, Brand Brew Media',
  openGraph: {
    title: 'Brand Brew Media — We Brew Brands',
    description: 'Full-service digital marketing agency that brews powerful brands.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${montserrat.variable}`}>
      <body className="font-montserrat bg-brand-black text-white antialiased">{children}</body>
    </html>
  )
}
