'use client'
import { useState, useEffect } from 'react'
import { clients as store, type Client } from '@/lib/storage'
import { Plus, Search, Edit2, Trash2, X, Save, Mail, Phone, Building, DollarSign } from 'lucide-react'

const STATUS_OPTS = ['active', 'inactive', 'prospect'] as const
const SERVICE_OPTS = ['SEO', 'Social Media Marketing', 'Brand Identity Design', 'Performance Advertising', 'Content Creation', 'Video Production', 'Full Package']
const STATUS_COLORS: Record<Client['status'], string> = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  prospect: 'bg-yellow-500/20 text-yellow-400',
}

const BLANK: Omit<Client, 'id' | 'joinDate'> = {
  name: '', email: '', phone: '', company: '', service: '', status: 'prospect', notes: '', value: 0,
}

export default function ClientsPage() {
  const [items, setItems] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Client['status']>('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(BLANK)

  const load = () => setItems(store.list())
  useEffect(() => { load() }, [])

  const filtered = items.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (statusFilter === 'all' || c.status === statusFilter)
    )
  })

  const openAdd = () => { setEditing(null); setForm(BLANK); setModal(true) }
  const openEdit = (c: Client) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, service: c.service, status: c.status, notes: c.notes, value: c.value }); setModal(true) }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return alert('Name and Email required')
    if (editing) {
      store.update(editing.id, form)
    } else {
      store.add(form)
    }
    setModal(false); load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this client?')) { store.remove(id); load() }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Client Management</h1>
          <p className="font-montserrat text-sm text-gray-400 mt-1">Track and manage all your clients.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['active', 'prospect', 'inactive'] as const).map(s => (
          <div key={s} className="glass p-4 text-center">
            <div className="font-bebas text-3xl text-white">{items.filter(c => c.status === s).length}</div>
            <div className="font-montserrat text-xs text-gray-400 capitalize">{s}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search clients..."
            className="admin-input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', ...STATUS_OPTS] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-montserrat font-semibold uppercase tracking-wide rounded-lg border transition-all capitalize
                          ${statusFilter === s ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Client', 'Company', 'Service', 'Status', 'Value', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat text-xs text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center font-montserrat text-sm text-gray-500">No clients found. Add your first client!</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-red flex items-center justify-center font-bebas text-sm text-white">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-montserrat text-sm text-white font-medium">{c.name}</div>
                        <div className="font-montserrat text-xs text-gray-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-montserrat text-sm text-gray-300">{c.company || '—'}</td>
                  <td className="px-4 py-3 font-montserrat text-sm text-gray-300">{c.service || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-montserrat font-semibold px-2 py-1 rounded capitalize ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-montserrat text-sm text-white">
                    {c.value ? `₹${c.value.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-brand-red transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-brand-gray-dark border border-white/10 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bebas text-2xl text-white tracking-wide">
                {editing ? 'Edit Client' : 'Add Client'}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', icon: null, placeholder: 'Client name' },
                { key: 'email', label: 'Email', icon: null, placeholder: 'email@company.com' },
                { key: 'phone', label: 'Phone', icon: null, placeholder: '+91 98765 43210' },
                { key: 'company', label: 'Company', icon: null, placeholder: 'Company name' },
              ].map(f => (
                <div key={f.key}>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">{f.label}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Service</label>
                <select className="admin-input bg-brand-gray-mid" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                  <option value="">Select service</option>
                  {SERVICE_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                <select className="admin-input bg-brand-gray-mid" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Client['status'] })}>
                  {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Contract Value (₹)</label>
                <input
                  type="number"
                  className="admin-input"
                  placeholder="0"
                  value={form.value || ''}
                  onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Notes</label>
                <textarea rows={3} className="admin-input resize-none" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-brand-red text-white py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg">
                  <Save size={16} /> {editing ? 'Update' : 'Add Client'}
                </button>
                <button onClick={() => setModal(false)} className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white rounded-lg font-montserrat text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
