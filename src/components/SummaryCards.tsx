import { useApp } from '../context/AppContext'
import { formatCurrency } from '../lib/utils'
import { MetricSkeleton } from './LoadingSkeleton'

export default function SummaryCards() {
  const { state, totalSpent, dailyAverage, topCategory, filteredExpenses } = useApp()

  if (state.isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)}
      </div>
    )
  }

  const today = new Date()
  const isCurrentMonth = today.getMonth() === state.filterMonth && today.getFullYear() === state.filterYear
  const daysElapsed = isCurrentMonth ? today.getDate() : new Date(state.filterYear, state.filterMonth + 1, 0).getDate()

  const cards = [
    {
      label: 'Total This Month',
      value: formatCurrency(totalSpent),
      sub: 'Sum of all transactions',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      iconBg: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    },
    {
      label: 'Daily Avg',
      value: formatCurrency(dailyAverage),
      sub: `Over ${daysElapsed} day${daysElapsed !== 1 ? 's' : ''} this month`,
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Top Category',
      value: topCategory.category?.name ?? 'None',
      valueColor: topCategory.category?.color ?? '#475569',
      sub: topCategory.category ? `${formatCurrency(topCategory.amount)} spent` : 'No expenses yet',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      iconBg: topCategory.category
        ? { backgroundColor: `${topCategory.category.color}20`, color: topCategory.category.color }
        : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500',
    },
    {
      label: 'Transactions',
      value: String(filteredExpenses.length),
      sub: 'Items this month',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => (
        <div
          key={c.label}
          className="relative overflow-hidden bg-white dark:bg-slate-800/95 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500 opacity-40" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {c.label}
            </p>
            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${typeof c.iconBg === 'string' ? c.iconBg : ''}`}
              style={typeof c.iconBg !== 'string' ? c.iconBg : undefined}
            >
              {c.icon}
            </div>
          </div>
          <p
            className="text-lg sm:text-2xl font-extrabold text-slate-800 dark:text-white truncate"
            style={'valueColor' in c ? { color: c.valueColor } : undefined}
          >
            {c.value}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
