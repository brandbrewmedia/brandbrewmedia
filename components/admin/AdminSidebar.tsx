'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Users, Image, Star,
  Clock, TrendingUp, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { auth } from '@/lib/storage'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { href: '/admin/clients', icon: Users, label: 'Clients' },
  { href: '/admin/media', icon: Image, label: 'Media Library' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/attendance', icon: Clock, label: 'Attendance' },
  { href: '/admin/finance', icon: TrendingUp, label: 'Finance' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    auth.logout()
    router.push('/admin/login')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-brand-gray-dark border-r border-white/5 w-64">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="font-bebas text-xl text-white tracking-widest">Brand Brew</div>
        <div className="font-bebas text-xs text-brand-red tracking-[0.4em]">ADMIN PANEL</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 bg-brand-gray-dark p-2 rounded-lg border border-white/10 text-white"
        >
          <Menu size={20} />
        </button>

        {open && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 z-50 flex">
              <Sidebar />
              <button
                onClick={() => setOpen(false)}
                className="mt-4 ml-2 self-start text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
