import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function FamilySetup() {
  const { createFamily, joinFamily } = useApp()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [familyName, setFamilyName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!familyName.trim()) return
    setLoading(true)
    try {
      await createFamily(familyName.trim())
      navigate('/')
    } catch (e) {
      toast.error('Failed to create family')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      await joinFamily(joinCode.trim().toUpperCase())
      navigate('/')
    } catch (e) {
      toast.error('Invalid family code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-7-7 7M12 3v12" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {mode === 'choose' ? 'Welcome to Family Budget' : mode === 'create' ? 'Create a Family' : 'Join a Family'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'choose'
              ? 'Create a family group or join one with a code'
              : mode === 'create'
                ? 'Set up your family to track expenses together'
                : 'Enter the family code shared by your admin'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6">

          {mode === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full p-5 rounded-xl border-2 border-dashed border-teal-300 dark:border-teal-600 hover:border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center group-hover:scale-105 transition">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">Create a Family</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Start fresh and invite members</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full p-5 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center group-hover:scale-105 transition">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">Join a Family</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Use a code to join your family's space</p>
                  </div>
                </div>
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => signOut()}
                  className="w-full text-center text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 font-semibold transition"
                >
                  Sign out ({user?.email})
                </button>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. The Smiths"
                  className="px-4 py-3 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={!familyName.trim() || loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition shadow-sm"
              >
                {loading ? 'Creating...' : 'Create Family'}
              </button>
              <button
                onClick={() => setMode('choose')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition"
              >
                Back
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Family Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="e.g. ABC123"
                  maxLength={10}
                  className="px-4 py-3 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400 tracking-widest font-mono text-center text-lg uppercase"
                  autoFocus
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim() || loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition shadow-sm"
              >
                {loading ? 'Joining...' : 'Join Family'}
              </button>
              <button
                onClick={() => setMode('choose')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
