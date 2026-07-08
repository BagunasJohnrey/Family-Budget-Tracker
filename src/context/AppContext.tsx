import { createContext, useContext, useEffect, useReducer, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { isSupabaseConfigured, fetchCategories as fetchRemoteCategories, fetchExpenses as fetchRemoteExpenses, fetchProfiles as fetchRemoteProfiles, fetchRevenues as fetchRemoteRevenues, createCategory as dbCreateCategory, updateCategory as dbUpdateCategory, deleteCategory as dbDeleteCategory, createExpense as dbCreateExpense, updateExpense as dbUpdateExpense, deleteExpense as dbDeleteExpense, createProfile as dbCreateProfile, deleteProfile as dbDeleteProfile, createRevenue as dbCreateRevenue, deleteRevenue as dbDeleteRevenue, createNotification as dbCreateNotification } from '../lib/supabase'
import { loadCategories, saveCategories, loadExpenses, saveExpenses, loadProfiles, saveProfiles, loadRevenues, saveRevenues, getLastSyncTime, setLastSyncTime } from '../lib/storage'
import { useAuth } from './AuthContext'
import type { AppState, Category, Expense, Profile, NewExpenseInput, Revenue, NewRevenueInput, SortField, SortDirection } from '../types'
import { getDaysInMonth } from '../lib/utils'

const initialState: AppState = {
  categories: [],
  expenses: [],
  profiles: [],
  revenues: [],
  filterMonth: new Date().getMonth(),
  filterYear: new Date().getFullYear(),
  searchQuery: '',
  categoryFilter: 'ALL',
  memberFilter: 'ALL',
  isLoading: true,
  isDarkMode: localStorage.getItem('budget-dark-mode') === 'true',
  sortField: 'date',
  sortDirection: 'desc',
}

type Action =
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_PROFILES'; payload: Profile[] }
  | { type: 'SET_REVENUES'; payload: Revenue[] }
  | { type: 'SET_FILTER_MONTH'; payload: number }
  | { type: 'SET_FILTER_YEAR'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY_FILTER'; payload: string }
  | { type: 'SET_MEMBER_FILTER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SORT'; payload: { field: SortField; direction: SortDirection } }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload }
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload }
    case 'SET_REVENUES':
      return { ...state, revenues: action.payload }
    case 'SET_FILTER_MONTH':
      return { ...state, filterMonth: action.payload }
    case 'SET_FILTER_YEAR':
      return { ...state, filterYear: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_CATEGORY_FILTER':
      return { ...state, categoryFilter: action.payload }
    case 'SET_MEMBER_FILTER':
      return { ...state, memberFilter: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'TOGGLE_DARK_MODE': {
      const next = !state.isDarkMode
      localStorage.setItem('budget-dark-mode', String(next))
      return { ...state, isDarkMode: next }
    }
    case 'SET_SORT':
      return { ...state, sortField: action.payload.field, sortDirection: action.payload.direction }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  userId: string
  isConnected: boolean
  isSyncing: boolean
  lastSyncAt: number | null
  syncNow: () => Promise<void>
  addCategory: (name: string, color: string, budget?: number | null) => Promise<void>
  editCategory: (catId: string, name: string, color: string, budget?: number | null) => Promise<void>
  deleteCategoryAction: (catId: string) => Promise<void>
  addExpense: (input: NewExpenseInput) => Promise<void>
  editExpense: (id: string, input: Partial<NewExpenseInput>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  addMember: (displayName: string) => Promise<void>
  removeMember: (profileId: string) => Promise<void>
  memberNames: string[]
  addRevenue: (input: NewRevenueInput) => Promise<void>
  removeRevenue: (id: string) => Promise<void>
  totalRevenue: number
  revenueCount: number
  notifications: { text: string; time: string }[]
  notificationsRead: number
  markNotificationsRead: () => void
  addNotification: (msg: string) => void
  filteredExpenses: Expense[]
  totalSpent: number
  dailyAverage: number
  topCategory: { category: Category | null; amount: number }
  categoryTotals: Record<string, number>
}

const AppCtx = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()
  const isSyncingRef = useRef(false)

  const userId = user?.id ?? ''
  const [isConnected, setIsConnected] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(getLastSyncTime())
  interface NotificationItem {
    text: string
    time: string
  }
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsRead, setNotificationsRead] = useState(0)
  const addNotification = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString()
    const item: NotificationItem = { text: msg, time }
    setNotifications(prev => [item, ...prev].slice(0, 50))
    setNotificationsRead(prev => prev)
    if (userId) {
      dbCreateNotification(userId, msg).catch(() => {})
    }
  }, [userId])
  const markNotificationsRead = useCallback(() => {
    setNotificationsRead(notifications.length)
  }, [notifications.length])

  isSyncingRef.current = isSyncing

  // ─── Init: load local immediately, then try remote ──────
  useEffect(() => {
    const localCats = loadCategories()
    const localExps = loadExpenses()
    const localProfiles = loadProfiles()
    const localRevs = loadRevenues()

    if (localCats.length > 0 || localExps.length > 0) {
      dispatch({ type: 'SET_CATEGORIES', payload: localCats })
      dispatch({ type: 'SET_EXPENSES', payload: localExps })
    }
    if (localProfiles.length > 0) {
      dispatch({ type: 'SET_PROFILES', payload: localProfiles })
    } else if (userId && user?.email) {
      const displayName = user.email.split('@')[0]
      const id = crypto.randomUUID()
      const profile: Profile = { id, user_id: userId, display_name: displayName, created_at: new Date().toISOString() }
      saveProfiles([profile])
      dispatch({ type: 'SET_PROFILES', payload: [profile] })
      dbCreateProfile(userId, id, displayName).catch(() => {})
    }
    if (localRevs.length > 0) {
      dispatch({ type: 'SET_REVENUES', payload: localRevs })
    }

    if (userId) {
      connectSupabase()
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [userId])

  // ─── Shared merge (push local → remote, pull remote → local) ──
  async function mergeRemote() {
    if (!userId || !isSupabaseConfigured()) return

    const localCats = loadCategories()
    const localExps = loadExpenses()
    const localRevs = loadRevenues()

    let hasErrors = false
    const logError = (label: string, err: unknown) => {
      hasErrors = true
      console.error(`Sync error [${label}]`, err)
      addNotification(`Sync error: ${label}`)
    }

    const safeFetch = <T,>(label: string, fn: () => Promise<T[]>): Promise<T[]> =>
      fn().catch(err => { logError(label, err); return [] })

    const [remoteCats, remoteExps, remoteProfiles, remoteRevs] = await Promise.all([
      safeFetch('categories', () => fetchRemoteCategories(userId)),
      safeFetch('expenses', () => fetchRemoteExpenses(userId)),
      safeFetch('profiles', () => fetchRemoteProfiles(userId)),
      safeFetch('revenues', () => fetchRemoteRevenues(userId)),
    ])

    if (!hasErrors) setIsConnected(true)

    const remoteCatIds = new Set(remoteCats.map(c => c.id))
    const remoteExpIds = new Set(remoteExps.map(e => e.id))
    const remoteRevIds = new Set(remoteRevs.map(r => r.id))
    const localCatIds = new Set(localCats.map(c => c.id))
    const localExpIds = new Set(localExps.map(e => e.id))
    const localRevIds = new Set(localRevs.map(r => r.id))

    for (const cat of localCats) {
      if (!remoteCatIds.has(cat.id)) {
        try { await dbCreateCategory(userId, cat.id, { name: cat.name, color: cat.color }) } catch (e) { logError('push category', e) }
      }
    }
    for (const exp of localExps) {
      if (!remoteExpIds.has(exp.id)) {
        try {
          await dbCreateExpense(userId, exp.id, {
            title: exp.title, amount: exp.amount,
            category_id: exp.category_id, date: exp.date,
            notes: exp.notes, is_recurring: exp.is_recurring,
            member_name: exp.member_name,
          })
        } catch (e) { logError('push expense', e) }
      }
    }
    for (const rev of localRevs) {
      if (!remoteRevIds.has(rev.id)) {
        try { await dbCreateRevenue(userId, rev.id, { amount: rev.amount, service: rev.service, client_name: rev.client_name, date: rev.date, notes: rev.notes }) } catch (e) { logError('push revenue', e) }
      }
    }

    const mergedCats = [...localCats]
    for (const cat of remoteCats) {
      if (!localCatIds.has(cat.id)) mergedCats.push(cat)
    }
    const mergedExps = [...localExps]
    for (const exp of remoteExps) {
      if (!localExpIds.has(exp.id)) mergedExps.push(exp)
    }
    const mergedRevs = [...localRevs]
    for (const rev of remoteRevs) {
      if (!localRevIds.has(rev.id)) mergedRevs.push(rev)
    }

    saveCategories(mergedCats)
    saveExpenses(mergedExps)
    saveProfiles(remoteProfiles)
    saveRevenues(mergedRevs)
    dispatch({ type: 'SET_CATEGORIES', payload: mergedCats })
    dispatch({ type: 'SET_EXPENSES', payload: mergedExps })
    dispatch({ type: 'SET_PROFILES', payload: remoteProfiles })
    dispatch({ type: 'SET_REVENUES', payload: mergedRevs })

    setLastSyncTime()
    setLastSyncAt(Date.now())
  }

  async function connectSupabase() {
    if (!isSupabaseConfigured() || !userId) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    try {
      await mergeRemote()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        // silent — offline
      } else {
        console.error('Supabase error:', msg)
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // ─── Dark mode ──────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode)
  }, [state.isDarkMode])

  // ─── Auto-sync on reconnect ──────────────────────────────
  useEffect(() => {
    function handleOnline() {
      setIsConnected(true)
      if (userId) {
        syncNow()
      }
    }
    function handleOffline() {
      setIsConnected(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [userId])

  // ─── Sync now (manual) ──────────────────────────────────
  const syncNow = useCallback(async () => {
    if (isSyncingRef.current || !userId) return
    setIsSyncing(true)

    try {
      if (!isSupabaseConfigured()) {
        toast.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
        return
      }
      await mergeRemote()
      toast.success('Sync complete')
      addNotification('Sync complete')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast.error(`Sync failed: ${msg}`)
      addNotification(`Sync failed: ${msg}`)
    } finally {
      setIsSyncing(false)
    }
  }, [userId])

  // ─── Mutations ──────────────────────────────────────────
  const addCategory = useCallback(async (name: string, color: string, budget?: number | null) => {
    if (!userId) return
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const cat: Category = { id, user_id: userId, name, color, budget: budget ?? null, created_at: now }
    const updated = [...state.categories, cat]
    saveCategories(updated)
    dispatch({ type: 'SET_CATEGORIES', payload: updated })
    try { await dbCreateCategory(userId, id, { name, color }) } catch (e) { console.error('db createCategory', e) }
    toast.success('Category created')
    addNotification(`Category "${name}" created`)
  }, [state.categories, userId, addNotification])

  const deleteCategoryAction = useCallback(async (catId: string) => {
    const linked = state.expenses.some(e => e.category_id === catId)
    if (linked) { toast.error('Has linked expenses'); return }
    const updated = state.categories.filter(c => c.id !== catId)
    saveCategories(updated)
    dispatch({ type: 'SET_CATEGORIES', payload: updated })
    try { await dbDeleteCategory(catId) } catch (e) { console.error('db deleteCategory', e) }
    toast.success('Category deleted')
  }, [state.categories, state.expenses])

  const editCategory = useCallback(async (catId: string, name: string, color: string, budget?: number | null) => {
    const updated = state.categories.map(c => c.id === catId ? { ...c, name, color, budget: budget ?? null } : c)
    saveCategories(updated)
    dispatch({ type: 'SET_CATEGORIES', payload: updated })
    try { await dbUpdateCategory(catId, { name, color, budget: budget ?? null }) } catch (e) { console.error('db updateCategory', e) }
    toast.success('Category updated')
    addNotification(`Category updated to "${name}"`)
  }, [state.categories, addNotification])

  const addExpense = useCallback(async (input: NewExpenseInput) => {
    if (!userId) return
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const exp: Expense = {
      id, user_id: userId,
      title: input.title, amount: input.amount,
      category_id: input.category_id, date: input.date,
      notes: input.notes ?? '', is_recurring: input.is_recurring ?? false,
      member_name: input.member_name ?? '',
      created_at: now,
    }
    const updated = [exp, ...state.expenses]
    saveExpenses(updated)
    dispatch({ type: 'SET_EXPENSES', payload: updated })
    try { await dbCreateExpense(userId, id, input) } catch (e) { console.error('db createExpense', e) }
    toast.success('Expense added')
    addNotification(`"${input.title}" — ₱${input.amount.toLocaleString()}`)
  }, [state.expenses, userId, addNotification])

  const editExpense = useCallback(async (id: string, input: Partial<NewExpenseInput>) => {
    const updated = state.expenses.map(e => e.id === id ? { ...e, ...input } : e)
    saveExpenses(updated)
    dispatch({ type: 'SET_EXPENSES', payload: updated })
    try { await dbUpdateExpense(id, input) } catch (e) { console.error('db updateExpense', e) }
    toast.success('Expense updated')
    addNotification('Expense updated')
  }, [state.expenses, addNotification])

  const removeExpense = useCallback(async (id: string) => {
    const updated = state.expenses.filter(e => e.id !== id)
    saveExpenses(updated)
    dispatch({ type: 'SET_EXPENSES', payload: updated })
    try { await dbDeleteExpense(id) } catch (e) { console.error('db deleteExpense', e) }
    toast.success('Expense deleted')
    addNotification('Expense deleted')
  }, [state.expenses, addNotification])

  // ─── Members ─────────────────────────────────────────────
  const addMember = useCallback(async (displayName: string) => {
    if (!userId) return
    const id = crypto.randomUUID()
    const profile: Profile = { id, user_id: userId, display_name: displayName, created_at: new Date().toISOString() }
    const updated = [...state.profiles, profile]
    saveProfiles(updated)
    dispatch({ type: 'SET_PROFILES', payload: updated })
    try { await dbCreateProfile(userId, id, displayName) } catch (e) { console.error('db createProfile', e) }
    toast.success(`Member "${displayName}" added`)
    addNotification(`Member "${displayName}" added`)
  }, [state.profiles, userId, addNotification])

  const removeMember = useCallback(async (profileId: string) => {
    const profile = state.profiles.find(p => p.id === profileId)
    const updated = state.profiles.filter(p => p.id !== profileId)
    saveProfiles(updated)
    dispatch({ type: 'SET_PROFILES', payload: updated })
    try { await dbDeleteProfile(profileId) } catch (e) { console.error('db deleteProfile', e) }
    toast.success(`Member "${profile?.display_name}" removed`)
  }, [state.profiles])

  const memberNames = useMemo(() => {
    return state.profiles.map(p => p.display_name)
  }, [state.profiles])

  // ─── Revenue ──────────────────────────────────────────────
  const addRevenue = useCallback(async (input: NewRevenueInput) => {
    if (!userId) return
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const rev: Revenue = {
      id, user_id: userId,
      amount: input.amount,
      service: input.service,
      client_name: input.client_name,
      date: input.date,
      notes: input.notes ?? '',
      created_at: now,
    }
    const updated = [rev, ...state.revenues]
    saveRevenues(updated)
    dispatch({ type: 'SET_REVENUES', payload: updated })
    try { await dbCreateRevenue(userId, id, input) } catch (e) { console.error('db createRevenue', e) }
    toast.success('Revenue added')
    addNotification(`Revenue: ₱${input.amount.toLocaleString()} — ${input.service}`)
  }, [state.revenues, userId, addNotification])

  const removeRevenue = useCallback(async (id: string) => {
    const updated = state.revenues.filter(r => r.id !== id)
    saveRevenues(updated)
    dispatch({ type: 'SET_REVENUES', payload: updated })
    try { await dbDeleteRevenue(id) } catch (e) { console.error('db deleteRevenue', e) }
    toast.success('Revenue entry removed')
    addNotification('Revenue entry removed')
  }, [state.revenues, addNotification])

  // ─── Computed values ────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    const { filterMonth, filterYear, searchQuery, categoryFilter, memberFilter, sortField, sortDirection } = state
    let list = state.expenses.filter(exp => {
      const d = new Date(exp.date + 'T00:00:00')
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear
    })
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q))
    }
    if (categoryFilter !== 'ALL') {
      list = list.filter(e => e.category_id === categoryFilter)
    }
    if (memberFilter !== 'ALL') {
      list = list.filter(e => e.member_name === memberFilter)
    }
    list.sort((a, b) => {
      let cmp = 0
      if (sortField === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortField === 'amount') cmp = a.amount - b.amount
      else if (sortField === 'member_name') cmp = a.member_name.localeCompare(b.member_name)
      else cmp = a.title.localeCompare(b.title)
      return sortDirection === 'desc' ? -cmp : cmp
    })
    return list
  }, [state])

  const { totalSpent, categoryTotals } = useMemo(() => {
    const totals: Record<string, number> = {}
    let sum = 0
    for (const exp of filteredExpenses) {
      sum += exp.amount
      totals[exp.category_id] = (totals[exp.category_id] ?? 0) + exp.amount
    }
    return { totalSpent: sum, categoryTotals: totals }
  }, [filteredExpenses])

  const dailyAverage = useMemo(() => {
    const days = getDaysInMonth(state.filterYear, state.filterMonth)
    const today = new Date()
    const isCurrent = today.getMonth() === state.filterMonth && today.getFullYear() === state.filterYear
    const divisor = isCurrent ? today.getDate() : days
    return divisor > 0 ? totalSpent / divisor : 0
  }, [totalSpent, state.filterMonth, state.filterYear])

  const topCategory = useMemo(() => {
    let topId: string | null = null
    let topAmt = 0
    for (const [catId, amt] of Object.entries(categoryTotals)) {
      if (amt > topAmt) { topAmt = amt; topId = catId }
    }
    const category = topId ? state.categories.find(c => c.id === topId) ?? null : null
    return { category, amount: topAmt }
  }, [categoryTotals, state.categories])

  const { totalRevenue, revenueCount } = useMemo(() => {
    const now = new Date()
    const m = now.getMonth()
    const y = now.getFullYear()
    let sum = 0
    let count = 0
    for (const r of state.revenues) {
      const d = new Date(r.date + 'T00:00:00')
      if (d.getMonth() === m && d.getFullYear() === y) {
        sum += r.amount
        count++
      }
    }
    return { totalRevenue: sum, revenueCount: count }
  }, [state.revenues])

  return (
    <AppCtx.Provider
      value={{
        state, dispatch, userId, isConnected, isSyncing, lastSyncAt, syncNow,
        addCategory, editCategory, deleteCategoryAction,
        addExpense, editExpense, removeExpense,
        addMember, removeMember, memberNames,
        addRevenue, removeRevenue, totalRevenue, revenueCount,
        notifications, notificationsRead, markNotificationsRead, addNotification,
        filteredExpenses, totalSpent, dailyAverage, topCategory, categoryTotals,
      }}
    >
      {children}
    </AppCtx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}


