import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Portfolio from '@/components/Portfolio'
import VideoGallery from '@/components/VideoGallery'
import Reviews from '@/components/Reviews'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <VideoGallery />
      <Reviews />
      <ContactForm />
      <Footer />
    </main>
  )
}
