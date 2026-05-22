'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Users, Image, Star, Clock, TrendingUp,
  TrendingDown, DollarSign, Bell, ArrowUpRight,
} from 'lucide-react'
import { enquiries, clients, finance, attendance, employees, reviews } from '@/lib/storage'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    enquiries: 0, newEnquiries: 0, clients: 0, activeClients: 0,
    income: 0, expense: 0, profit: 0, reviewCount: 0, presentToday: 0,
  })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const allEmployees = employees.list()
    const todayAtt = attendance.forDate(today)
    const presentCount = todayAtt.filter(r => r.status === 'present' || r.status === 'half-day').length
    const fin = finance.summary()
    setStats({
      enquiries: enquiries.list().length,
      newEnquiries: enquiries.unreadCount(),
      clients: clients.list().length,
      activeClients: clients.list().filter(c => c.status === 'active').length,
      income: fin.income,
      expense: fin.expense,
      profit: fin.profit,
      reviewCount: reviews.list().length,
      presentToday: presentCount,
    })
  }, [])

  const cards = [
    {
      title: 'Enquiries',
      value: stats.enquiries,
      sub: `${stats.newEnquiries} new`,
      icon: MessageSquare,
      href: '/admin/enquiries',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Clients',
      value: stats.clients,
      sub: `${stats.activeClients} active`,
      icon: Users,
      href: '/admin/clients',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      title: 'Revenue',
      value: `₹${stats.income.toLocaleString('en-IN')}`,
      sub: `Profit: ₹${stats.profit.toLocaleString('en-IN')}`,
      icon: DollarSign,
      href: '/admin/finance',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      title: 'Reviews',
      value: stats.reviewCount,
      sub: 'Total reviews',
      icon: Star,
      href: '/admin/reviews',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      sub: 'Employees',
      icon: Clock,
      href: '/admin/attendance',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Expenses',
      value: `₹${stats.expense.toLocaleString('en-IN')}`,
      sub: 'Total outflow',
      icon: TrendingDown,
      href: '/admin/finance',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Dashboard</h1>
          <p className="font-montserrat text-sm text-gray-400 mt-1">
            Welcome back — here&apos;s what&apos;s brewing today.
          </p>
        </div>
        {stats.newEnquiries > 0 && (
          <Link
            href="/admin/enquiries"
            className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 px-4 py-2 rounded-lg hover:bg-brand-red/20 transition-colors"
          >
            <Bell size={16} className="text-brand-red" />
            <span className="font-montserrat text-sm text-brand-red">
              {stats.newEnquiries} new {stats.newEnquiries === 1 ? 'enquiry' : 'enquiries'}
            </span>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="glass p-6 hover:border-brand-red/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${card.bg} flex items-center justify-center rounded-lg`}>
                  <Icon size={20} className={card.color} />
                </div>
                <ArrowUpRight size={16} className="text-gray-600 group-hover:text-brand-red transition-colors" />
              </div>
              <div className="font-bebas text-3xl text-white tracking-wide">{card.value}</div>
              <div className="font-montserrat text-xs text-gray-500 mt-1">{card.sub}</div>
              <div className="font-montserrat text-sm text-gray-300 font-medium mt-2">{card.title}</div>
            </Link>
          )
        })}
      </div>

      {/* P&L Banner */}
      <div className={`glass p-6 rounded-lg border ${stats.profit >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-montserrat text-xs text-gray-400 uppercase tracking-widest mb-1">
              Net Profit / Loss
            </div>
            <div className={`font-bebas text-4xl tracking-wide ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.profit >= 0 ? '+' : ''}₹{stats.profit.toLocaleString('en-IN')}
            </div>
          </div>
          <TrendingUp size={48} className={stats.profit >= 0 ? 'text-green-400/20' : 'text-red-400/20'} />
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Client', href: '/admin/clients', icon: Users },
          { label: 'Upload Media', href: '/admin/media', icon: Image },
          { label: 'Log Attendance', href: '/admin/attendance', icon: Clock },
          { label: 'Add Transaction', href: '/admin/finance', icon: DollarSign },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className="glass p-4 flex items-center gap-3 hover:border-brand-red/30 transition-all duration-200 group"
            >
              <Icon size={18} className="text-brand-red" />
              <span className="font-montserrat text-sm text-gray-300 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
