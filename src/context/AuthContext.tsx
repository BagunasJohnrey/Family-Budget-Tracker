import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, onAuthChange, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser, isSupabaseConfigured, createUserLogin } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      return
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const { data: { subscription } } = onAuthChange((event, u) => {
      setUser(u)
      if (event === 'SIGNED_IN' && u) {
        createUserLogin(u.id, u.email ?? undefined, u.app_metadata?.provider ?? 'email').catch(() => {})
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    try {
      await signInWithEmail(email, password)
      toast.success('Welcome back!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid login credentials')) {
        toast.error('Wrong email or password')
      } else {
        toast.error('Login failed')
      }
      throw err
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const data = await signUpWithEmail(email, password)
      if (data.user?.identities?.length === 0) {
        toast.error('An account with this email already exists')
        throw new Error('User exists')
      }
      toast.success('Account created! Check your email to confirm.')
    } catch (err) {
      if (err instanceof Error && err.message === 'User exists') throw err
      toast.error('Sign up failed')
      throw err
    }
  }

  async function googleSignIn() {
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Google sign-in failed')
    }
  }

  async function signOut() {
    try {
      await signOutUser()
      toast.success('Signed out')
    } catch {
      toast.error('Sign out failed')
    }
  }

  return (
    <AuthCtx.Provider value={{ user, isLoading, signIn, signUp, googleSignIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

