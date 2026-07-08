import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const ITEMS_PER_PAGE = 5

export default function NotificationBell() {
  const { notifications, notificationsRead, markNotificationsRead } = useApp()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open) setPage(1)
  }, [open])

  const unread = notifications.length - notificationsRead
  const totalPages = Math.max(1, Math.ceil(notifications.length / ITEMS_PER_PAGE))
  const shown = notifications.slice(0, page * ITEMS_PER_PAGE)

  function handleToggle() {
    if (!open) markNotificationsRead()
    setOpen(v => !v)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-xs text-slate-400 text-center">No notifications yet</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/50 overflow-y-auto">
                {shown.map((n, i) => (
                  <li key={i} className={`px-4 py-2.5 text-xs sm:text-sm leading-snug ${i < notificationsRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 bg-teal-50/50 dark:bg-teal-900/10'}`}>
                    <span className="block">{n.text}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</span>
                  </li>
                ))}
              </ul>
              {notifications.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <span className="text-[10px] text-slate-400">{shown.length} of {notifications.length}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
