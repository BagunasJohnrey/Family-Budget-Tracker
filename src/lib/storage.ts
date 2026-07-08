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

function scopeKey(key: string, familyId?: string): string {
  return familyId ? `${key}_${familyId}` : key
}

export function loadCategories(familyId?: string): Category[] {
  return read<Category[]>(scopeKey('budget_categories', familyId), [])
}

export function saveCategories(cats: Category[], familyId?: string): void {
  write(scopeKey('budget_categories', familyId), cats)
}

export function loadExpenses(familyId?: string): Expense[] {
  return read<Expense[]>(scopeKey('budget_expenses', familyId), [])
}

export function saveExpenses(exps: Expense[], familyId?: string): void {
  write(scopeKey('budget_expenses', familyId), exps)
}

export function loadProfiles(familyId?: string): Profile[] {
  return read<Profile[]>(scopeKey('budget_profiles', familyId), [])
}

export function saveProfiles(profiles: Profile[], familyId?: string): void {
  write(scopeKey('budget_profiles', familyId), profiles)
}

export function loadRevenues(familyId?: string): Revenue[] {
  return read<Revenue[]>(scopeKey('barber_revenues', familyId), [])
}

export function saveRevenues(revs: Revenue[], familyId?: string): void {
  write(scopeKey('barber_revenues', familyId), revs)
}

export function getLastSyncTime(): number | null {
  return read<number | null>('budget_last_sync', null)
}

export function setLastSyncTime(): void {
  write('budget_last_sync', Date.now())
}

export function getCachedFamilyId(): string | null {
  return read<string | null>('budget_family_id', null)
}

export function setCachedFamilyId(id: string | null): void {
  if (id) {
    write('budget_family_id', id)
  } else {
    localStorage.removeItem('budget_family_id')
  }
}

const STORAGE_KEYS = ['budget_categories', 'budget_expenses', 'budget_profiles', 'barber_revenues', 'budget_last_sync', 'budget_family_id'] as const

export function clearAllData(): void {
  for (const key of STORAGE_KEYS) {
    const prefix = key + '_'
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k === key || k?.startsWith(prefix)) {
        localStorage.removeItem(k)
      }
    }
  }
}
