export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  budget: number | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  title: string
  amount: number
  category_id: string
  date: string
  notes: string
  is_recurring: boolean
  member_name: string
  created_at: string
}

export interface NewCategoryInput {
  name: string
  color: string
  budget?: number | null
}

export interface NewExpenseInput {
  title: string
  amount: number
  category_id: string
  date: string
  notes?: string
  is_recurring?: boolean
  member_name?: string
}

export interface Profile {
  id: string
  user_id: string
  display_name: string
  created_at: string
}

export interface Revenue {
  id: string
  user_id: string
  amount: number
  service: string
  client_name: string
  date: string
  notes: string
  created_at: string
}

export interface NewRevenueInput {
  amount: number
  service: string
  client_name: string
  date: string
  notes?: string
}

export type SortField = 'date' | 'amount' | 'title' | 'member_name'
export type SortDirection = 'asc' | 'desc'

export interface AppState {
  categories: Category[]
  expenses: Expense[]
  profiles: Profile[]
  revenues: Revenue[]
  filterMonth: number
  filterYear: number
  searchQuery: string
  categoryFilter: string
  memberFilter: string
  isLoading: boolean
  isDarkMode: boolean
  sortField: SortField
  sortDirection: SortDirection
}

export const CATEGORY_COLORS = [
  '#0d9488', '#0891b2', '#e11d48', '#d97706',
  '#4f46e5', '#7c3aed', '#059669', '#db2777',
  '#ca8a04', '#ea580c', '#6366f1', '#84cc16',
]

export const DEFAULT_MEMBERS = ['John', 'Jane', 'Kids']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
