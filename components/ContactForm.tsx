'use client'
import { useState } from 'react'
import { Send, CheckCircle, Mail, Phone, MapPin } from 'lucide-react'
import { enquiries } from '@/lib/storage'

const SERVICES = [
  'SEO', 'Social Media Marketing', 'Brand Identity Design',
  'Performance Advertising', 'Content Creation', 'Video Production', 'Full Package',
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (!form.phone.match(/^[0-9+\s\-()]{7,15}$/)) e.phone = 'Valid phone required'
    if (!form.service) e.service = 'Select a service'
    if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    setTimeout(() => {
      enquiries.add(form)
      setSubmitting(false)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', service: '', message: '' })
    }, 1000)
  }

  return (
    <section id="contact" className="py-28 bg-brand-black relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-montserrat text-xs font-semibold tracking-[0.4em] text-brand-red uppercase block mb-4">
            Get In Touch
          </span>
          <h2 className="section-title mb-6">
            Let&apos;s Brew <span className="text-brand-red">Together</span>
          </h2>
          <p className="font-montserrat text-gray-400 text-lg max-w-2xl mx-auto">
            Ready to elevate your brand? Fill in the form and our team will reach out within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-bebas text-3xl text-white tracking-wide mb-2">Brand Brew Media</h3>
              <p className="font-montserrat text-gray-400 text-sm leading-relaxed">
                We&apos;re a passionate team of digital marketers, designers, and strategists committed to
                brewing brands that leave a lasting impression.
              </p>
            </div>

            {[
              { icon: Mail, label: 'Email Us', value: 'hello@brandbrew.in' },
              { icon: Phone, label: 'Call Us', value: '+91 98765 43210' },
              { icon: MapPin, label: 'Visit Us', value: 'Chennai, Tamil Nadu, India' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-brand-red" />
                </div>
                <div>
                  <div className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mb-1">
                    {item.label}
                  </div>
                  <div className="font-montserrat text-white font-medium">{item.value}</div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <div className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mb-4">
                Follow Us
              </div>
              <div className="flex gap-3">
                {['IN', 'FB', 'LI', 'YT'].map(s => (
                  <div
                    key={s}
                    className="w-10 h-10 border border-white/10 flex items-center justify-center
                               hover:border-brand-red hover:bg-brand-red transition-all duration-200
                               font-bebas text-xs text-gray-400 hover:text-white cursor-pointer"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {success ? (
              <div className="glass p-12 text-center">
                <CheckCircle size={56} className="text-green-400 mx-auto mb-6" />
                <h3 className="font-bebas text-3xl text-white tracking-wide mb-3">
                  Message Sent!
                </h3>
                <p className="font-montserrat text-gray-400 mb-8">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button onClick={() => setSuccess(false)} className="btn-primary">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass p-8 md:p-10 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-brand-red text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <p className="text-brand-red text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-brand-red text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                      Service Needed *
                    </label>
                    <select
                      className="form-input bg-brand-gray-dark"
                      value={form.service}
                      onChange={e => setForm({ ...form, service: e.target.value })}
                    >
                      <option value="">Select a service</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.service && <p className="text-brand-red text-xs mt-1">{errors.service}</p>}
                  </div>
                </div>

                <div>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    className="form-input resize-none"
                    placeholder="Tell us about your project, goals, and timeline..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                  {errors.message && <p className="text-brand-red text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
