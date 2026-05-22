'use client'
import { useState, useEffect } from 'react'
import { enquiries as store, type Enquiry } from '@/lib/storage'
import { Search, Trash2, Send, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react'

const STATUS_COLORS: Record<Enquiry['status'], string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  read: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  replied: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function EnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | Enquiry['status']>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  const load = () => setItems(store.list())
  useEffect(() => { load() }, [])

  const filtered = items.filter(e => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.service.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || e.status === filter
    return matchSearch && matchFilter
  })

  const markRead = (id: string) => {
    store.update(id, { status: 'read' })
    load()
  }

  const handleReply = (id: string) => {
    const text = replyText[id]?.trim()
    if (!text) return
    store.update(id, { status: 'replied', reply: text, repliedAt: new Date().toISOString() })
    setReplyText(r => ({ ...r, [id]: '' }))
    load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this enquiry?')) { store.remove(id); load() }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Enquiries CRM</h1>
        <p className="font-montserrat text-sm text-gray-400 mt-1">
          Manage contact form submissions and follow-ups.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email or service..."
            className="admin-input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'read', 'replied', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-montserrat font-semibold uppercase tracking-wide rounded-lg border transition-all
                          ${filter === s ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="font-montserrat text-xs text-gray-500 mb-4">
        {filtered.length} enquir{filtered.length === 1 ? 'y' : 'ies'}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass p-12 text-center text-gray-500 font-montserrat text-sm">
            No enquiries found.
          </div>
        )}
        {filtered.map(item => (
          <div
            key={item.id}
            className={`glass border transition-all duration-200 ${item.status === 'new' ? 'border-blue-500/30' : 'border-white/5'}`}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer"
              onClick={() => {
                setExpanded(expanded === item.id ? null : item.id)
                if (item.status === 'new') { markRead(item.id) }
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-brand-red flex items-center justify-center font-bebas text-lg text-white flex-shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-montserrat font-semibold text-white text-sm">{item.name}</span>
                    {item.status === 'new' && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-montserrat font-semibold">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="font-montserrat text-xs text-gray-400 truncate">
                    {item.service} · {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`hidden sm:inline text-xs font-montserrat font-semibold px-2 py-1 rounded border uppercase tracking-wide ${STATUS_COLORS[item.status]}`}>
                  {item.status}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                {expanded === item.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {/* Expanded */}
            {expanded === item.id && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-brand-red flex-shrink-0" />
                    <a href={`mailto:${item.email}`} className="text-gray-300 hover:text-brand-red transition-colors truncate">{item.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-brand-red flex-shrink-0" />
                    <span className="text-gray-300">{item.phone}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Service: <span className="text-white">{item.service}</span>
                  </div>
                </div>

                <div className="bg-brand-gray-mid/50 p-4 rounded-lg">
                  <div className="font-montserrat text-xs text-gray-500 uppercase tracking-wide mb-2">Message</div>
                  <p className="font-montserrat text-sm text-gray-300 leading-relaxed">{item.message}</p>
                </div>

                {item.reply && (
                  <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                    <div className="font-montserrat text-xs text-green-400 uppercase tracking-wide mb-2">
                      Your Reply · {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString() : ''}
                    </div>
                    <p className="font-montserrat text-sm text-gray-300 leading-relaxed">{item.reply}</p>
                  </div>
                )}

                {/* Reply box */}
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Type your reply here..."
                    className="admin-input resize-none"
                    value={replyText[item.id] || ''}
                    onChange={e => setReplyText(r => ({ ...r, [item.id]: e.target.value }))}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReply(item.id)}
                      className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 text-sm font-montserrat font-semibold hover:bg-brand-red-light transition-colors rounded-lg"
                    >
                      <Send size={14} /> Send Reply
                    </button>
                    <button
                      onClick={() => { store.update(item.id, { status: 'closed' }); load() }}
                      className="text-sm font-montserrat text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Mark Closed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
