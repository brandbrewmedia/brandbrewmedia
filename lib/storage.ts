// Centralised localStorage helpers for all CRM data

export type Enquiry = {
  id: string
  name: string
  email: string
  phone: string
  service: string
  message: string
  date: string
  status: 'new' | 'read' | 'replied' | 'closed'
  reply?: string
  repliedAt?: string
}

export type Client = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  service: string
  status: 'active' | 'inactive' | 'prospect'
  joinDate: string
  notes: string
  value: number
}

export type MediaItem = {
  id: string
  type: 'photo' | 'video' | 'youtube'
  name: string
  url: string          // base64 for photos/videos, YouTube URL for youtube type
  thumbnail?: string
  youtubeId?: string
  category: string
  uploadedAt: string
  size?: number
}

export type Review = {
  id: string
  author: string
  company: string
  rating: number
  text: string
  avatar?: string
  date: string
  featured: boolean
  visible: boolean
}

export type AttendanceRecord = {
  id: string
  employeeId: string
  employeeName: string
  date: string
  status: 'present' | 'absent' | 'half-day' | 'leave'
  checkIn?: string
  checkOut?: string
  notes?: string
}

export type Employee = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  joinDate: string
  active: boolean
}

export type Transaction = {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  client?: string
  receipt?: string
  notes?: string
}

// ---- Generic helpers ----
function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ---- Enquiries ----
const EQ_KEY = 'bbm_enquiries'
export const enquiries = {
  list: (): Enquiry[] => get<Enquiry[]>(EQ_KEY, []),
  add: (data: Omit<Enquiry, 'id' | 'date' | 'status'>): Enquiry => {
    const item: Enquiry = { ...data, id: uid(), date: new Date().toISOString(), status: 'new' }
    set(EQ_KEY, [item, ...enquiries.list()])
    return item
  },
  update: (id: string, patch: Partial<Enquiry>): void => {
    set(EQ_KEY, enquiries.list().map(e => (e.id === id ? { ...e, ...patch } : e)))
  },
  remove: (id: string): void => {
    set(EQ_KEY, enquiries.list().filter(e => e.id !== id))
  },
  unreadCount: (): number => enquiries.list().filter(e => e.status === 'new').length,
}

// ---- Clients ----
const CL_KEY = 'bbm_clients'
export const clients = {
  list: (): Client[] => get<Client[]>(CL_KEY, []),
  add: (data: Omit<Client, 'id' | 'joinDate'>): Client => {
    const item: Client = { ...data, id: uid(), joinDate: new Date().toISOString() }
    set(CL_KEY, [...clients.list(), item])
    return item
  },
  update: (id: string, patch: Partial<Client>): void => {
    set(CL_KEY, clients.list().map(c => (c.id === id ? { ...c, ...patch } : c)))
  },
  remove: (id: string): void => {
    set(CL_KEY, clients.list().filter(c => c.id !== id))
  },
}

// ---- Media ----
const MD_KEY = 'bbm_media'
export const media = {
  list: (): MediaItem[] => get<MediaItem[]>(MD_KEY, []),
  add: (item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem => {
    const newItem: MediaItem = { ...item, id: uid(), uploadedAt: new Date().toISOString() }
    set(MD_KEY, [newItem, ...media.list()])
    return newItem
  },
  update: (id: string, patch: Partial<MediaItem>): void => {
    set(MD_KEY, media.list().map(m => (m.id === id ? { ...m, ...patch } : m)))
  },
  remove: (id: string): void => {
    set(MD_KEY, media.list().filter(m => m.id !== id))
  },
}

// ---- Reviews ----
const RV_KEY = 'bbm_reviews'
export const reviews = {
  list: (): Review[] => get<Review[]>(RV_KEY, []),
  add: (data: Omit<Review, 'id' | 'date'>): Review => {
    const item: Review = { ...data, id: uid(), date: new Date().toISOString() }
    set(RV_KEY, [...reviews.list(), item])
    return item
  },
  update: (id: string, patch: Partial<Review>): void => {
    set(RV_KEY, reviews.list().map(r => (r.id === id ? { ...r, ...patch } : r)))
  },
  remove: (id: string): void => {
    set(RV_KEY, reviews.list().filter(r => r.id !== id))
  },
  visible: (): Review[] => reviews.list().filter(r => r.visible),
}

// ---- Employees ----
const EM_KEY = 'bbm_employees'
const seedEmployees: Employee[] = [
  { id: uid(), name: 'Arjun Nair', role: 'Creative Director', email: 'arjun@brandbrew.in', phone: '9876543210', joinDate: '2023-01-15', active: true },
  { id: uid(), name: 'Sneha Pillai', role: 'Social Media Manager', email: 'sneha@brandbrew.in', phone: '9876543211', joinDate: '2023-03-01', active: true },
  { id: uid(), name: 'Vikram Das', role: 'SEO Specialist', email: 'vikram@brandbrew.in', phone: '9876543212', joinDate: '2023-06-15', active: true },
  { id: uid(), name: 'Meera Reddy', role: 'Content Writer', email: 'meera@brandbrew.in', phone: '9876543213', joinDate: '2024-01-10', active: true },
]
export const employees = {
  list: (): Employee[] => {
    const stored = get<Employee[]>(EM_KEY, [])
    if (stored.length === 0) { set(EM_KEY, seedEmployees); return seedEmployees }
    return stored
  },
  add: (data: Omit<Employee, 'id'>): Employee => {
    const item: Employee = { ...data, id: uid() }
    set(EM_KEY, [...employees.list(), item])
    return item
  },
  update: (id: string, patch: Partial<Employee>): void => {
    set(EM_KEY, employees.list().map(e => (e.id === id ? { ...e, ...patch } : e)))
  },
  remove: (id: string): void => {
    set(EM_KEY, employees.list().filter(e => e.id !== id))
  },
}

// ---- Attendance ----
const AT_KEY = 'bbm_attendance'
export const attendance = {
  list: (): AttendanceRecord[] => get<AttendanceRecord[]>(AT_KEY, []),
  forDate: (date: string): AttendanceRecord[] =>
    attendance.list().filter(r => r.date === date),
  upsert: (record: Omit<AttendanceRecord, 'id'>): void => {
    const all = attendance.list()
    const existing = all.findIndex(
      r => r.employeeId === record.employeeId && r.date === record.date
    )
    if (existing >= 0) {
      all[existing] = { ...all[existing], ...record }
      set(AT_KEY, all)
    } else {
      set(AT_KEY, [...all, { ...record, id: uid() }])
    }
  },
  remove: (id: string): void => {
    set(AT_KEY, attendance.list().filter(r => r.id !== id))
  },
}

// ---- Finance ----
const FN_KEY = 'bbm_finance'
export const finance = {
  list: (): Transaction[] => get<Transaction[]>(FN_KEY, []),
  add: (data: Omit<Transaction, 'id'>): Transaction => {
    const item: Transaction = { ...data, id: uid() }
    set(FN_KEY, [...finance.list(), item])
    return item
  },
  update: (id: string, patch: Partial<Transaction>): void => {
    set(FN_KEY, finance.list().map(t => (t.id === id ? { ...t, ...patch } : t)))
  },
  remove: (id: string): void => {
    set(FN_KEY, finance.list().filter(t => t.id !== id))
  },
  summary: () => {
    const all = finance.list()
    const income = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, profit: income - expense }
  },
}

// ---- Auth ----
export const auth = {
  login: (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'brandbrew2025') {
      localStorage.setItem('bbm_auth', '1')
      return true
    }
    return false
  },
  logout: (): void => {
    localStorage.removeItem('bbm_auth')
  },
  check: (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('bbm_auth') === '1'
  },
}
