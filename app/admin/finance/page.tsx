'use client'
import { useState, useEffect } from 'react'
import { finance as store, type Transaction } from '@/lib/storage'
import { Plus, Trash2, Edit2, X, Save, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react'

const INCOME_CATS = ['Client Payment', 'Project Fee', 'Retainer', 'Consultation', 'Other Income']
const EXPENSE_CATS = ['Salaries', 'Tools & Software', 'Advertising', 'Office Rent', 'Equipment', 'Freelancers', 'Travel', 'Utilities', 'Other Expense']

const BLANK: Omit<Transaction, 'id'> = {
  type: 'income', category: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0], client: '', notes: '',
}

export default function FinancePage() {
  const [items, setItems] = useState<Transaction[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  const load = () => setItems(store.list())
  useEffect(() => { load() }, [])

  const byMonth = items.filter(t => t.date.startsWith(month))
  const filtered = byMonth.filter(t => {
    const q = search.toLowerCase()
    return (
      (filter === 'all' || t.type === filter) &&
      (t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.client || '').toLowerCase().includes(q))
    )
  }).sort((a, b) => b.date.localeCompare(a.date))

  const totalIncome = byMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = byMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const profit = totalIncome - totalExpense

  const openAdd = (type: Transaction['type'] = 'income') => {
    setEditing(null)
    setForm({ ...BLANK, type, category: '', date: new Date().toISOString().split('T')[0] })
    setModal(true)
  }
  const openEdit = (t: Transaction) => {
    setEditing(t)
    setForm({ type: t.type, category: t.category, description: t.description, amount: t.amount, date: t.date, client: t.client || '', notes: t.notes || '' })
    setModal(true)
  }

  const handleSave = () => {
    if (!form.description.trim() || !form.amount || !form.category) return alert('Description, category and amount required')
    if (editing) {
      store.update(editing.id, form)
    } else {
      store.add(form)
    }
    setModal(false); load()
  }

  const handleDelete = (id: string) => { if (confirm('Delete this transaction?')) { store.remove(id); load() } }

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Finance CRM</h1>
          <p className="font-montserrat text-sm text-gray-400 mt-1">Track income, expenses, and profit & loss.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openAdd('income')} className="flex items-center gap-2 bg-green-600/80 text-white px-3 py-2 font-montserrat font-semibold text-sm hover:bg-green-600 transition-colors rounded-lg">
            <Plus size={14} /> Income
          </button>
          <button onClick={() => openAdd('expense')} className="flex items-center gap-2 bg-red-600/80 text-white px-3 py-2 font-montserrat font-semibold text-sm hover:bg-red-600 transition-colors rounded-lg">
            <Plus size={14} /> Expense
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Month</label>
          <input type="month" className="admin-input w-auto" value={month} onChange={e => setMonth(e.target.value)} />
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-400" />
            <span className="font-montserrat text-xs text-gray-400 uppercase tracking-widest">Income</span>
          </div>
          <div className="font-bebas text-3xl text-green-400">₹{totalIncome.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass p-5 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-red-400" />
            <span className="font-montserrat text-xs text-gray-400 uppercase tracking-widest">Expenses</span>
          </div>
          <div className="font-bebas text-3xl text-red-400">₹{totalExpense.toLocaleString('en-IN')}</div>
        </div>
        <div className={`glass p-5 border-l-4 ${profit >= 0 ? 'border-yellow-500' : 'border-red-500'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className={profit >= 0 ? 'text-yellow-400' : 'text-red-400'} />
            <span className="font-montserrat text-xs text-gray-400 uppercase tracking-widest">Net Profit</span>
          </div>
          <div className={`font-bebas text-3xl ${profit >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}₹{profit.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search transactions..." className="admin-input pl-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-montserrat font-semibold uppercase tracking-wide rounded-lg border transition-all capitalize
                          ${filter === f ? 'bg-brand-red text-white border-brand-red' : 'text-gray-400 border-white/10 hover:border-brand-red'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Date', 'Description', 'Category', 'Client', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat text-xs text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center font-montserrat text-sm text-gray-500">No transactions for this period.</td></tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                  <td className="px-4 py-3 font-montserrat text-xs text-gray-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="font-montserrat text-sm text-white">{t.description}</div>
                    {t.notes && <div className="font-montserrat text-xs text-gray-500">{t.notes}</div>}
                  </td>
                  <td className="px-4 py-3 font-montserrat text-xs text-gray-400">{t.category}</td>
                  <td className="px-4 py-3 font-montserrat text-xs text-gray-400">{t.client || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-montserrat text-sm font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-brand-red transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 font-montserrat text-xs text-gray-500 uppercase tracking-widest">
                    {filtered.length} transactions shown
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-montserrat text-sm font-semibold text-white">
                      Net: {' '}
                      <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ₹{profit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-brand-gray-dark border border-white/10 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bebas text-2xl text-white tracking-wide">
                {editing ? 'Edit Transaction' : `Add ${form.type === 'income' ? 'Income' : 'Expense'}`}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {!editing && (
                <div>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Type</label>
                  <div className="flex gap-3">
                    {(['income', 'expense'] as const).map(t => (
                      <button key={t} onClick={() => setForm({ ...form, type: t, category: '' })}
                        className={`flex-1 py-2 font-montserrat font-semibold text-sm rounded-lg border transition-all capitalize
                                    ${form.type === t ? (t === 'income' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'text-gray-400 border-white/10'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                  <input type="date" className="admin-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Amount (₹)</label>
                  <input type="number" className="admin-input" placeholder="0" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="admin-input bg-brand-gray-mid" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Description *</label>
                <input type="text" className="admin-input" placeholder="What is this for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Client (optional)</label>
                <input type="text" className="admin-input" placeholder="Associated client" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
              </div>
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Notes</label>
                <textarea rows={2} className="admin-input resize-none" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-brand-red text-white py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg">
                  <Save size={16} /> {editing ? 'Update' : 'Save'}
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
