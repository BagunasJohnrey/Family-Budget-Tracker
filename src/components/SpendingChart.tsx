import { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import { useApp } from '../context/AppContext'
import { ChartSkeleton } from './LoadingSkeleton'
import Card from './Card'

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend)

export default function SpendingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state, categoryTotals, totalSpent } = useApp()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ChartJS.getChart(canvas)?.destroy()

    const catsWithSpend = Object.entries(categoryTotals).filter(([, amt]) => amt > 0)
    if (catsWithSpend.length === 0) return

    const labels = catsWithSpend.map(([catId]) => {
      const cat = state.categories.find(c => c.id === catId)
      return cat?.name ?? 'Uncategorized'
    })
    const data = catsWithSpend.map(([, amt]) => amt)
    const colors = catsWithSpend.map(([catId]) => {
      const cat = state.categories.find(c => c.id === catId)
      return cat?.color ?? '#94a3b8'
    })

    const isDark = document.documentElement.classList.contains('dark')

    new ChartJS(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: isDark ? '#1e293b' : '#ffffff',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              padding: 12,
              font: { size: 10, family: 'Inter', weight: '600' as any },
              color: isDark ? '#94a3b8' : '#475569',
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f1f5f9' : '#1e293b',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label(ctx) {
                const value = ctx.parsed as number
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return ` ${ctx.label}: ₱${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pct}%)`
              },
            },
          },
        },
      },
    })

    return () => { ChartJS.getChart(canvasRef.current!)?.destroy() }
  }, [categoryTotals, state.categories, state.isDarkMode])

  const hasData = Object.values(categoryTotals).some(v => v > 0)

  if (state.isLoading) return <ChartSkeleton />

  return (
    <Card title="Spending Distribution">
      <div className="relative flex-1 min-h-0">
        <canvas ref={canvasRef} className={hasData ? '' : 'hidden'} />
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            <svg className="w-16 h-16 mb-2 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <span>No expenses to map</span>
          </div>
        )}
        {hasData && totalSpent > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white">₱{Math.round(totalSpent).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Total</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
