export function MetricSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800/95 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700/60 animate-pulse">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500 opacity-20" />
      <div className="flex justify-between items-start">
        <div className="space-y-2 sm:space-y-3">
          <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-5 sm:h-7 w-20 sm:w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-7 w-7 sm:h-10 sm:w-10 bg-slate-200 dark:bg-slate-700 rounded-lg sm:rounded-xl" />
      </div>
      <div className="hidden sm:block mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm animate-pulse">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500 opacity-30" />
        <div className="p-6">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="flex items-center justify-center h-64">
            <div className="h-48 w-48 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LedgerSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm animate-pulse">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500 opacity-20" />
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
