import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import ConfirmModal from './ConfirmModal'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { state, dispatch, isConnected, isSyncing, lastSyncAt, syncNow } = useApp()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showSyncConfirm, setShowSyncConfirm] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  function handleSyncClick() {
    if (isSyncing) return
    setShowSyncConfirm(true)
  }

  function handleConfirmSync() {
    setShowSyncConfirm(false)
    syncNow()
  }

  const syncButton = (
    <button
      onClick={handleSyncClick}
      disabled={isSyncing}
      title={
        isConnected
          ? lastSyncAt
            ? `Last synced ${new Date(lastSyncAt).toLocaleTimeString()}`
            : 'Sync data to cloud'
          : 'Offline — tap to retry'
      }
      className={cn(
        'relative px-2.5 py-1.5 rounded-xl flex items-center space-x-1.5 text-xs font-semibold transition border',
        isSyncing
          ? 'bg-teal-800/50 border-teal-500/30 cursor-wait'
          : isConnected
            ? 'bg-teal-800/50 border-teal-500/30 hover:bg-teal-700/50'
            : 'bg-amber-900/40 border-amber-500/20 hover:bg-amber-800/40'
      )}
    >
      {isSyncing ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
      <span className="relative flex h-2 w-2">
        <span className={cn(
          'absolute inline-flex h-full w-full rounded-full opacity-75',
          isSyncing ? 'animate-ping bg-amber-400' : isConnected ? 'bg-emerald-400' : 'bg-amber-400'
        )} />
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          isSyncing ? 'bg-amber-400' : isConnected ? 'bg-emerald-400' : 'bg-amber-400'
        )} />
      </span>
    </button>
  )

  const darkModeButton = (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
      className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition min-w-[36px] min-h-[36px] flex items-center justify-center"
      title="Toggle dark mode"
    >
      {state.isDarkMode ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )

  const userMenu = (
    <div className="relative">
      <button
        onClick={() => setShowLogout(!showLogout)}
        className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold transition min-h-[36px]"
      >
        <svg className="w-3.5 h-3.5 mr-1.5 text-teal-200 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <span className="text-teal-100 max-w-[80px] sm:max-w-[120px] truncate">
          {user?.email?.split('@')[0] ?? 'User'}
        </span>
      </button>

      {showLogout && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowLogout(false)} />
          <div className="absolute right-0 mt-1.5 z-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[160px]">
            <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 truncate">
              {user?.email}
            </div>
            <button
              onClick={() => { setShowLogout(false); navigate('/profiles') }}
              className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold flex items-center space-x-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Profiles</span>
            </button>
            <button
              onClick={() => { setShowLogout(false); signOut() }}
              className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold flex items-center space-x-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      <header className="bg-gradient-to-r from-teal-600 to-cyan-700 dark:from-teal-800 dark:to-cyan-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-md shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-7-7 7M12 3v12" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">Family Budget Tracker</h1>
              <p className="text-[10px] sm:text-xs text-teal-100/80 truncate">Expense Tracker</p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            <NotificationBell />
            {syncButton}
            {darkModeButton}
            {userMenu}
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center space-x-1">
            <NotificationBell />
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="relative p-2 rounded-xl bg-white/10 min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              {isSyncing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span className={cn(
                'absolute top-1 right-1 w-2 h-2 rounded-full',
                isSyncing ? 'bg-amber-400 animate-ping' : isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              )} />
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl bg-white/10 min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-teal-500/30 bg-teal-700 dark:bg-teal-900 px-3 py-3 space-y-2 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-200 font-semibold">Theme</span>
              {darkModeButton}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-200 font-semibold">Account</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-teal-100 max-w-[100px] truncate">
                  {user?.email?.split('@')[0] ?? 'User'}
                </span>
                <button
                  onClick={() => { setShowMobileMenu(false); signOut() }}
                  className="text-xs text-rose-300 hover:text-rose-200 font-semibold bg-white/10 px-3 py-1.5 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
            {lastSyncAt && (
              <div className="text-[10px] text-teal-300/70">
                Last sync: {new Date(lastSyncAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </header>

      <ConfirmModal
        open={showSyncConfirm}
        onClose={() => setShowSyncConfirm(false)}
        onConfirm={handleConfirmSync}
        title="Sync to Cloud?"
        message="This will push your local data to the cloud and pull any changes from other devices."
        confirmLabel="Sync Now"
        icon={
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        }
      />
    </>
  )
}
