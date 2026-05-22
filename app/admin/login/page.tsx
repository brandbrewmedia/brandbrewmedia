'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { auth } from '@/lib/storage'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth.check()) router.replace('/admin')
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (auth.login(form.username, form.password)) {
        router.replace('/admin')
      } else {
        setError('Invalid credentials. Try admin / brandbrew2025')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-bebas text-5xl text-white tracking-widest">Brand Brew</div>
          <div className="font-bebas text-sm text-brand-red tracking-[0.5em]">ADMIN PORTAL</div>
        </div>

        <div className="glass p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-red/10 flex items-center justify-center">
              <Lock size={18} className="text-brand-red" />
            </div>
            <div>
              <h1 className="font-montserrat font-semibold text-white">Sign In</h1>
              <p className="font-montserrat text-xs text-gray-400">Access your admin dashboard</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                Username
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="admin-input pr-10"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-montserrat text-xs text-brand-red bg-brand-red/10 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-montserrat text-xs text-gray-600 mt-6">
          © Brand Brew Media — Secure Admin Access
        </p>
      </div>
    </div>
  )
}
