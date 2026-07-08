import { createClient } from '@supabase/supabase-js'
import type { Category, Expense, Profile, Revenue, NewRevenueInput, Family, FamilyMember } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co')
}

// ─── Auth ──────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
  return data
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthChange(callback: (event: string, user: import('@supabase/supabase-js').User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null)
  })
}

// ─── Families ──────────────────────────────────────────────
function generateFamilyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createFamily(name: string, createdBy: string): Promise<Family> {
  const code = generateFamilyCode()
  const { data: family, error: famErr } = await supabase
    .from('families')
    .insert({ name, code, created_by: createdBy })
    .select()
    .single()
  if (famErr) throw famErr

  const { error: memErr } = await supabase
    .from('family_members')
    .insert({ family_id: family.id, user_id: createdBy, role: 'admin' })
  if (memErr) throw memErr

  return family
}

export async function joinFamily(code: string, userId: string): Promise<Family> {
  const { data: family, error: findErr } = await supabase
    .from('families')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()
  if (findErr) throw new Error('Invalid family code')

  const { error: memErr } = await supabase
    .from('family_members')
    .insert({ family_id: family.id, user_id: userId, role: 'member' })
  if (memErr) throw memErr

  return family
}

export async function fetchUserFamily(userId: string): Promise<Family | null> {
  const { data: members } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!members) return null

  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', members.family_id)
    .single()

  return family
}

export async function fetchFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
  if (error) throw error
  return data ?? []
}

// ─── Profiles ──────────────────────────────────────────────
export async function fetchProfiles(familyId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('display_name')
  if (error) throw error
  return data ?? []
}

export async function createProfile(userId: string, familyId: string, id: string, displayName: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id, user_id: userId, family_id: familyId, display_name: displayName })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProfile(profileId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId)
  if (error) throw error
}

// ─── Revenues ───────────────────────────────────────────────
export async function fetchRevenues(familyId: string): Promise<Revenue[]> {
  const { data, error } = await supabase
    .from('revenues')
    .select('*')
    .eq('family_id', familyId)
    .order('date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createRevenue(userId: string, familyId: string, id: string, input: NewRevenueInput): Promise<Revenue> {
  const { data, error } = await supabase
    .from('revenues')
    .insert({
      id, user_id: userId, family_id: familyId,
      amount: input.amount,
      service: input.service,
      client_name: input.client_name,
      date: input.date,
      notes: input.notes ?? '',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRevenue(revId: string): Promise<void> {
  const { error } = await supabase
    .from('revenues')
    .delete()
    .eq('id', revId)
  if (error) throw error
}

// ─── Categories ────────────────────────────────────────────
export async function fetchCategories(familyId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('family_id', familyId)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createCategory(userId: string, familyId: string, id: string, input: { name: string; color: string }): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ id, user_id: userId, family_id: familyId, name: input.name, color: input.color })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(catId: string, updates: { name?: string; color?: string; budget?: number | null }): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', catId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(catId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', catId)
  if (error) throw error
}

// ─── Expenses ──────────────────────────────────────────────
export async function fetchExpenses(familyId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('family_id', familyId)
    .order('date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createExpense(userId: string, familyId: string, id: string, input: {
  title: string
  amount: number
  category_id: string
  date: string
  notes?: string
  is_recurring?: boolean
  member_name?: string
}): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      id, user_id: userId, family_id: familyId,
      title: input.title,
      amount: input.amount,
      category_id: input.category_id,
      date: input.date,
      notes: input.notes ?? '',
      is_recurring: input.is_recurring ?? false,
      member_name: input.member_name ?? '',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExpense(expId: string, updates: Partial<Expense>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(expId: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expId)
  if (error) throw error
}

// ─── Notifications ──────────────────────────────────────────
export async function createNotification(userId: string, familyId: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, family_id: familyId, message })
  if (error) throw error
}

// ─── User Logins ─────────────────────────────────────────────
export async function createUserLogin(userId: string, email?: string, provider?: string): Promise<void> {
  const { error } = await supabase
    .from('user_logins')
    .insert({ user_id: userId, email, provider: provider ?? 'email' })
  if (error) throw error
}
