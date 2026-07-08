import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate, downloadCSV } from '../lib/utils'
import { LedgerSkeleton } from './LoadingSkeleton'
import Card from './Card'
import ConfirmModal from './ConfirmModal'
import type { SortField } from '../types'
import toast from 'react-hot-toast'

interface ExpenseLedgerProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const ITEMS_PER_PAGE = 10

export default function ExpenseLedger({ onEdit, onDelete }: ExpenseLedgerProps) {
  const { state, dispatch, filteredExpenses, memberNames } = useApp()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredExpenses.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredExpenses, safePage])

  if (state.isLoading) return <LedgerSkeleton />

  if (safePage !== page) setPage(safePage)

  function handleSort(field: SortField) {
    const dir = state.sortField === field && state.sortDirection === 'desc' ? 'asc' : 'desc'
    dispatch({ type: 'SET_SORT', payload: { field, direction: dir } })
  }

  function handleExport() {
    const data = filteredExpenses.map(e => ({
      title: e.title,
      amount: e.amount,
      date: e.date,
      category: state.categories.find(c => c.id === e.category_id)?.name ?? 'Uncategorized',
      member: e.member_name,
      notes: e.notes,
    }))
    downloadCSV(data)
    toast.success('CSV exported successfully')
    setShowExportMenu(false)
  }

  function handleDeleteClick(id: string) {
    setDeleteConfirmId(id)
  }

  function handleDeleteConfirm() {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const sortArrow = (field: SortField) => {
    if (state.sortField !== field) return null
    return (
      <svg className={`w-3 h-3 ${state.sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    )
  }

  return (
    <>
      <Card className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Expense History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={state.searchQuery}
                onChange={e => { setPage(1); dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value }) }}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 w-full sm:w-28 lg:w-36 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={state.categoryFilter}
              onChange={e => { setPage(1); dispatch({ type: 'SET_CATEGORY_FILTER', payload: e.target.value }) }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs outline-none text-slate-600 dark:text-slate-300 font-semibold max-w-[110px] focus:bg-white dark:focus:bg-slate-900 transition"
            >
              <option value="ALL">All</option>
              {state.categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Member Filter */}
            <select
              value={state.memberFilter}
              onChange={e => { setPage(1); dispatch({ type: 'SET_MEMBER_FILTER', payload: e.target.value }) }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs outline-none text-slate-600 dark:text-slate-300 font-semibold max-w-[110px] focus:bg-white dark:focus:bg-slate-900 transition"
            >
              <option value="ALL">Everyone</option>
              {memberNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition inline-flex items-center space-x-1 min-h-[32px]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[140px]">
                    <button onClick={handleExport} className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">Export as CSV</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sort Bar - hidden on mobile */}
        <div className="hidden sm:flex items-center space-x-4 pb-2 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="w-10 shrink-0" />
          <button onClick={() => handleSort('title')} className="flex items-center space-x-1 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <span>Name</span>
            {sortArrow('title')}
          </button>
          <button onClick={() => handleSort('date')} className="flex items-center space-x-1 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <span>Date</span>
            {sortArrow('date')}
          </button>
          <button onClick={() => handleSort('member_name')} className="flex items-center space-x-1 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <span>Paid By</span>
            {sortArrow('member_name')}
          </button>
          <button onClick={() => handleSort('amount')} className="flex items-center space-x-1 ml-auto hover:text-slate-600 dark:hover:text-slate-300 transition">
            <span>Amount</span>
            {sortArrow('amount')}
          </button>
        </div>

        {/* Ledger List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] scrollbar-none -mx-2 px-2">
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-slate-400 dark:text-slate-500">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 dark:text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">No transactions found</p>
              <p className="text-xs mt-1">Adjust filters or add a new expense.</p>
            </div>
          ) : (
            pageItems.map((exp, idx) => {
              const cat = state.categories.find(c => c.id === exp.category_id) ?? { name: 'Uncategorized', color: '#94a3b8' }
              return (
                <div
                  key={exp.id}
                  className="py-3 sm:py-3.5 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/30 px-2 rounded-xl transition duration-150 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[140px] sm:max-w-xs">
                        {exp.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{formatDate(exp.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline-block" />
                        <span className="text-[10px] font-bold hidden sm:inline" style={{ color: cat.color }}>{cat.name}</span>
                        {exp.member_name && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{exp.member_name}</span>
                          </>
                        )}
                        {exp.is_recurring && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="text-[10px] text-amber-500 font-semibold">R</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mr-1 sm:mr-2">{formatCurrency(exp.amount)}</span>
                    <button onClick={() => onEdit(exp.id)} className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition sm:opacity-0 sm:group-hover:opacity-100" title="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteClick(exp.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition sm:opacity-0 sm:group-hover:opacity-100" title="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition ${
                    p === safePage
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction?"
        message="This will permanently remove this expense. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        icon={
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        }
      />
    </>
  )
}
