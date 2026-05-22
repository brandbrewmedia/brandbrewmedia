'use client'
import { useState, useEffect } from 'react'
import { employees as empStore, attendance as attStore, type Employee, type AttendanceRecord } from '@/lib/storage'
import { ChevronLeft, ChevronRight, Plus, Save, X, UserPlus, Check, Clock } from 'lucide-react'

const STATUS_OPTS = ['present', 'absent', 'half-day', 'leave'] as const
const STATUS_COLORS: Record<AttendanceRecord['status'], string> = {
  present: 'bg-green-500/20 text-green-400 border-green-500/30',
  absent: 'bg-red-500/20 text-red-400 border-red-500/30',
  'half-day': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  leave: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function dateString(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function AttendancePage() {
  const today = dateString(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [empList, setEmpList] = useState<Employee[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [empModal, setEmpModal] = useState(false)
  const [empForm, setEmpForm] = useState({ name: '', role: '', email: '', phone: '', joinDate: today, active: true })

  const loadAll = () => {
    setEmpList(empStore.list().filter(e => e.active))
    setRecords(attStore.forDate(selectedDate))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAll() }, [selectedDate])

  const getRecord = (empId: string): AttendanceRecord | undefined =>
    records.find(r => r.employeeId === empId)

  const markAttendance = (emp: Employee, status: AttendanceRecord['status']) => {
    attStore.upsert({
      employeeId: emp.id,
      employeeName: emp.name,
      date: selectedDate,
      status,
      checkIn: status === 'present' ? new Date().toTimeString().slice(0, 5) : undefined,
    })
    loadAll()
  }

  const changeDate = (days: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(dateString(d))
  }

  const saveEmp = () => {
    if (!empForm.name.trim()) return alert('Name required')
    empStore.add(empForm)
    setEmpModal(false)
    loadAll()
  }

  const allEmp = empStore.list().filter(e => e.active)
  const presentCount = records.filter(r => r.status === 'present' || r.status === 'half-day').length
  const absentCount = records.filter(r => r.status === 'absent').length
  const leaveCount = records.filter(r => r.status === 'leave').length

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Attendance Tracker</h1>
          <p className="font-montserrat text-sm text-gray-400 mt-1">Track daily employee attendance.</p>
        </div>
        <button
          onClick={() => setEmpModal(true)}
          className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg"
        >
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4 mb-6 glass p-4 inline-flex">
        <button onClick={() => changeDate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center min-w-[160px]">
          <div className="font-bebas text-2xl text-white">
            {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {selectedDate === today && (
            <div className="font-montserrat text-xs text-brand-red uppercase tracking-widest">Today</div>
          )}
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={selectedDate >= today}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={e => setSelectedDate(e.target.value)}
          className="admin-input w-auto text-xs"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: allEmp.length, color: 'text-white' },
          { label: 'Present', value: presentCount, color: 'text-green-400' },
          { label: 'Absent', value: absentCount, color: 'text-red-400' },
          { label: 'Leave', value: leaveCount, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="glass p-4 text-center">
            <div className={`font-bebas text-3xl ${s.color}`}>{s.value}</div>
            <div className="font-montserrat text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick mark all */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => allEmp.forEach(e => markAttendance(e, 'present'))}
          className="flex items-center gap-2 text-sm font-montserrat font-semibold text-green-400 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/10 transition-colors"
        >
          <Check size={14} /> Mark All Present
        </button>
      </div>

      {/* Employee Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Employee', 'Role', 'Status', 'Check In', 'Mark Attendance'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat text-xs text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allEmp.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center font-montserrat text-sm text-gray-500">No employees. Add your first employee!</td></tr>
              )}
              {allEmp.map(emp => {
                const rec = getRecord(emp.id)
                return (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-red flex items-center justify-center font-bebas text-sm text-white">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-montserrat text-sm text-white font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-montserrat text-sm text-gray-400">{emp.role}</td>
                    <td className="px-4 py-3">
                      {rec ? (
                        <span className={`text-xs font-montserrat font-semibold px-2 py-1 rounded border capitalize ${STATUS_COLORS[rec.status]}`}>
                          {rec.status.replace('-', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs font-montserrat text-gray-600">Not marked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-montserrat text-sm text-gray-400">
                      {rec?.checkIn ? (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-green-400" /> {rec.checkIn}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {STATUS_OPTS.map(s => (
                          <button
                            key={s}
                            onClick={() => markAttendance(emp, s)}
                            className={`text-xs px-2 py-1 font-montserrat font-semibold rounded border transition-all capitalize
                                        ${rec?.status === s ? STATUS_COLORS[s] : 'text-gray-600 border-white/10 hover:border-brand-red hover:text-brand-red'}`}
                          >
                            {s === 'half-day' ? '½' : s.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {empModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-brand-gray-dark border border-white/10 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bebas text-2xl text-white tracking-wide">Add Employee</h2>
              <button onClick={() => setEmpModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Employee name' },
                { key: 'role', label: 'Role / Designation', placeholder: 'e.g. Social Media Manager' },
                { key: 'email', label: 'Email', placeholder: 'employee@brandbrew.in' },
                { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
              ].map(f => (
                <div key={f.key}>
                  <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">{f.label}</label>
                  <input type="text" className="admin-input" placeholder={f.placeholder}
                    value={(empForm as any)[f.key]}
                    onChange={e => setEmpForm({ ...empForm, [f.key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="font-montserrat text-xs text-gray-400 uppercase tracking-widest block mb-1">Join Date</label>
                <input type="date" className="admin-input" value={empForm.joinDate}
                  onChange={e => setEmpForm({ ...empForm, joinDate: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveEmp} className="flex-1 flex items-center justify-center gap-2 bg-brand-red text-white py-2 font-montserrat font-semibold text-sm hover:bg-brand-red-light transition-colors rounded-lg">
                  <Save size={16} /> Add Employee
                </button>
                <button onClick={() => setEmpModal(false)} className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white rounded-lg font-montserrat text-sm transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
