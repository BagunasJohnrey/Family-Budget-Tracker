import { useEffect, useRef, useMemo } from 'react'
import { Chart as ChartJS, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { useApp } from '../context/AppContext'
import { getDaysInMonth } from '../lib/utils'
import Card from './Card'

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export default function DailyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state } = useApp()

  const dailyTotals = useMemo(() => {
    const days = getDaysInMonth(state.filterYear, state.filterMonth)
    const map: Record<number, number> = {}
    for (let d = 1; d <= days; d++) map[d] = 0
    for (const exp of state.expenses) {
      const dt = new Date(exp.date + 'T00:00:00')
      if (dt.getMonth() === state.filterMonth && dt.getFullYear() === state.filterYear) {
        map[dt.getDate()] = (map[dt.getDate()] ?? 0) + exp.amount
      }
    }
    return map
  }, [state.expenses, state.filterMonth, state.filterYear])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ChartJS.getChart(canvas)?.destroy()

    const isDark = document.documentElement.classList.contains('dark')
    const days = Object.keys(dailyTotals).map(Number)
    const values = days.map(d => dailyTotals[d])
    const hasData = values.some(v => v > 0)
    if (!hasData) return

    new ChartJS(canvas, {
      type: 'bar',
      data: {
        labels: days.map(String),
        datasets: [{
          label: 'Spent',
          data: values,
          backgroundColor: isDark ? '#14b8a6' : '#0d9488',
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f1f5f9' : '#1e293b',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label(ctx) {
                return ` ₱${(ctx.parsed.y as number).toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 9 } },
          },
          y: {
            grid: { color: isDark ? '#334155' : '#f1f5f9' },
            ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 9 }, callback: v => `₱${v}` },
          },
        },
      },
    })

    return () => { ChartJS.getChart(canvas)?.destroy() }
  }, [dailyTotals])

  const hasData = Object.values(dailyTotals).some(v => v > 0)

  return (
    <Card title="Daily Spending">
      <div className="h-56">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
            <svg className="w-10 h-10 mb-2 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>No data for this month</span>
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </Card>
  )
}
