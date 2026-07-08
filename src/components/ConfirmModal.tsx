import { useEffect, type ReactNode } from 'react'
import { cn } from '../lib/utils'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmLabel?: string
  confirmLoading?: boolean
  icon?: ReactNode
  variant?: 'default' | 'danger'
}

export default function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', confirmLoading = false,
  icon, variant = 'default',
}: ConfirmModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !confirmLoading) onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, confirmLoading])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/90" onClick={confirmLoading ? undefined : onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-700 animate-slide-up-mobile sm:animate-slide-up">
        {icon && (
          <div className="flex justify-center mb-4">{icon}</div>
        )}
        <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center mb-2">
          {title}
        </h3>
        <div className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-6">
          {message}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={confirmLoading}
            className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 font-semibold rounded-xl text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmLoading}
            className={cn(
              'flex-1 px-4 py-2.5 font-semibold rounded-xl text-sm transition disabled:opacity-40 inline-flex items-center justify-center space-x-2',
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            )}
          >
            {confirmLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
