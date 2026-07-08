import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import ConfirmModal from '../components/ConfirmModal'

export default function ProfilesPage() {
  const { state, addMember, removeMember } = useApp()
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    addMember(name)
    setNewName('')
  }

  const deleteName = deleteTarget
    ? state.profiles.find(p => p.id === deleteTarget)?.display_name ?? ''
    : ''

  return (
    <>
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Family Members
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage who uses this budget tracker</p>
            </div>
          </div>

          {/* Add member form */}
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Juan, Maria..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500/40 transition"
              />
            </div>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm"
            >
              Add Member
            </button>
          </form>

          {/* Member list */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            {state.profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">No members yet</p>
                <p className="text-xs mt-1">Add your first family member above</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {state.profiles.map(profile => (
                  <li key={profile.id} className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                        <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                          {profile.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{profile.display_name}</p>
                        <p className="text-[10px] text-slate-400">Added {new Date(profile.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(profile.id)}
                      className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { removeMember(deleteTarget); setDeleteTarget(null) } }}
        title="Remove Member"
        message={`Remove "${deleteName}" from the budget tracker? Their expenses will remain but won't be assigned to this member.`}
        confirmLabel="Remove"
        variant="danger"
        icon={
          <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
      />
    </>
  )
}
