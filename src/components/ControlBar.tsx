import { useApp } from '../context/AppContext'
import { MONTHS } from '../types'

interface ControlBarProps {
  onOpenCategoryModal: () => void
  onOpenExpenseModal: () => void
}

export default function ControlBar({ onOpenCategoryModal, onOpenExpenseModal }: ControlBarProps) {
  const { state, dispatch } = useApp()
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
          <select
            value={state.filterMonth}
            onChange={e => dispatch({ type: 'SET_FILTER_MONTH', payload: Number(e.target.value) })}
            className="px-2.5 py-1.5 bg-transparent outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer rounded-l-xl"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />
          <select
            value={state.filterYear}
            onChange={e => dispatch({ type: 'SET_FILTER_YEAR', payload: Number(e.target.value) })}
            className="px-2.5 py-1.5 bg-transparent outline-none text-slate-700 dark:text-slate-300 font-semibold cursor-pointer rounded-r-xl"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onOpenCategoryModal}
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>Categories</span>
        </button>
        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Expense</span>
        </button>
      </div>
    </div>
  )
}
