import { useApp } from '../context/AppContext'
import { formatCurrency } from '../lib/utils'
import Card from './Card'

export default function CategoryShareList() {
  const { state, categoryTotals, totalSpent } = useApp()

  return (
    <Card
      title="Spending Share"
      titleExtra={
        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold">
          {state.categories.length} categories
        </span>
      }
    >
      <div className="space-y-4 overflow-y-auto scrollbar-none flex-1 min-h-0 pr-1">
        {state.categories.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 py-6 text-sm">
            <svg className="w-10 h-10 mx-auto mb-2 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <p>No categories loaded</p>
          </div>
        ) : (
          state.categories.map(cat => {
            const spent = categoryTotals[cat.id] ?? 0
            const pct = totalSpent > 0 ? (spent / totalSpent) * 100 : 0
            const budget = cat.budget ?? 0
            const isOverBudget = budget > 0 && spent > budget

            return (
              <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100/75 dark:hover:bg-slate-900/80 transition border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2 inline-block shadow-xs" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(spent)}</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold ml-1">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden flex">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isOverBudget ? '#e11d48' : cat.color,
                    }}
                  />
                </div>
                {budget > 0 && (
                  <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Budget: {formatCurrency(budget)}</span>
                    <span className={isOverBudget ? 'text-rose-500 font-bold' : ''}>
                      {isOverBudget ? 'Over budget!' : `${((spent / budget) * 100).toFixed(0)}% used`}
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
