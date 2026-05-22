'use client'
import { useState, useEffect } from 'react'
import { reviews as store, type Review } from '@/lib/storage'
import { Plus, Star, Trash2, Edit2, Eye, EyeOff, Save, X } from 'lucide-react'

const BLANK: Omit<Review, 'id' | 'date'> = {
  author: '', company: '', rating: 5, text: '', featured: false, visible: true,
}

export default function ReviewsPage() {
  const [items, setItems] = useState<Review[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [form, setForm] = useState(BLANK)

  const load = () => setItems(store.list())
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(BLANK); setModal(true) }
  const openEdit = (r: Review) => {
    setEditing(r)
    setForm({ author: r.author, company: r.company, rating: r.rating, text: r.text, featured: r.featured, visible: r.visible })
    setModal(true)
  }

  const handleSave = () => {
    if (!form.author.trim() || !form.text.trim()) return alert('Author and review text required')
    if (editing) {
      store.update(editing.id, form)
    } else {
      store.add(form)
    }
    setModal(false); load()
  }

  const toggleVisible = (r: Review) => { store.update(r.id, { visible: !r.visible }); load() }
  const toggleFeatured = (r: Review) => { store.update(r.id, { featured: !r.featured }); load() }
  const handleDelete = (id: string) => { if (confirm('Delete this review?')) { store.remove(id); load() } }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Reviews Manager</h1>
          <p className="font-montserrat text-sm text-gray-400 mt-1">Manage testimonials shown on the public site.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg">
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 text-center">
          <div className="font-bebas text-3xl text-white">{items.length}</div>
          <div className="font-montserrat text-xs text-gray-400">Total</div>
        </div>
        <div className="glass p-4 text-center">
          <div className="font-bebas text-3xl text-green-400">{items.filter(r => r.visible).length}</div>
          <div className="font-montserrat text-xs text-gray-400">Visible</div>
        </div>
        <div className="glass p-4 text-center">
          <div className="font-bebas text-3xl text-yellow-400">{items.filter(r => r.featured).length}</div>
          <div className="font-montserrat text-xs text-gray-400">Featured</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="glass p-12 text-center text-gray-500 font-montserrat text-sm">No reviews yet.</div>
        )}
        {items.map(r => (
          <div key={r.id} className={`glass p-5 transition-all ${!r.visible ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 bg-brand-red flex items-center justify-center font-bebas text-lg text-white flex-shrink-0">
                  {r.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-montserrat font-semibold text-white text-sm">{r.author}</span>
                    <span className="font-montserrat text-xs text-gray-400">{r.company}</span>
                    {r.featured && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded font-montserrat font-semibold">Featured</span>
                    )}
                    {!r.visible && (
                      <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-0.5 rounded font-montserrat font-semibold">Hidden</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? 'text-yellow-400' : 'text-gray-600'} fill={i < r.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="font-montserrat text-sm text-gray-300 leading-relaxed">{r.text}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleFeatured(r)} title={r.featured ? 'Unfeature' : 'Feature'}
                  className={`p-1.5 rounded transition-colors ${r.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-yellow-400'}`}>
                  <Star size={16} />
                </button>
                <button onClick={() => toggleVisible(r)} title={r.visible ? 'Hide' : 'Show'}
                  className="p-1.5 rounded text-gray-600 hover:text-white transition-colors">
                  {r.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(r)} className="p-1.5 rounded text-gray-600 hover:text-brand-red transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-brand-gray-dark border border-white/10 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bebas text-2xl text-white tracking-wide">{editing ? 'Edit Review' : 'Add Review'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Author Name *</label>
                  <input type="text" className="admin-input" placeholder="John Doe" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                </div>
                <div>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Company</label>
                  <input type="text" className="admin-input" placeholder="Company Ltd" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })}
                      className="p-1 transition-colors">
                      <Star size={24} className={n <= form.rating ? 'text-yellow-400' : 'text-gray-600'} fill={n <= form.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Review Text *</label>
                <textarea rows={4} className="admin-input resize-none" placeholder="Client review text..." value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-brand-red" />
                  <span className="font-montserrat text-sm text-gray-300">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} className="accent-brand-red" />
                  <span className="font-montserrat text-sm text-gray-300">Visible on site</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-brand-red text-white py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg">
                  <Save size={16} /> {editing ? 'Update' : 'Add Review'}
                </button>
                <button onClick={() => setModal(false)} className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white rounded-lg font-montserrat text-sm transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
