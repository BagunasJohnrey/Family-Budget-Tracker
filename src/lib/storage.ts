import type { Category, Expense, Profile, Revenue } from '../types'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to write to localStorage:', e)
  }
}

export function loadCategories(): Category[] {
  return read<Category[]>('budget_categories', [])
}

export function saveCategories(cats: Category[]): void {
  write('budget_categories', cats)
}

export function loadExpenses(): Expense[] {
  return read<Expense[]>('budget_expenses', [])
}

export function saveExpenses(exps: Expense[]): void {
  write('budget_expenses', exps)
}

export function loadProfiles(): Profile[] {
  return read<Profile[]>('budget_profiles', [])
}

export function saveProfiles(profiles: Profile[]): void {
  write('budget_profiles', profiles)
}

export function loadRevenues(): Revenue[] {
  return read<Revenue[]>('barber_revenues', [])
}

export function saveRevenues(revs: Revenue[]): void {
  write('barber_revenues', revs)
}

export function getLastSyncTime(): number | null {
  return read<number | null>('budget_last_sync', null)
}

export function setLastSyncTime(): void {
  write('budget_last_sync', Date.now())
}
