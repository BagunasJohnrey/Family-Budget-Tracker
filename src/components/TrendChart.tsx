import { useEffect, useRef, useMemo } from 'react'
import { Chart as ChartJS, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler } from 'chart.js'
import { useApp } from '../context/AppContext'
import Card from './Card'

ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TrendChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state } = useApp()

  const monthlyTotals = useMemo(() => {
    const now = new Date()
    const map: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      map[key] = 0
    }
    for (const exp of state.expenses) {
      const d = new Date(exp.date + 'T00:00:00')
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in map) map[key] += exp.amount
    }
    return map
  }, [state.expenses])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ChartJS.getChart(canvas)?.destroy()

    const entries = Object.entries(monthlyTotals)
    if (entries.every(([, v]) => v === 0)) return

    const isDark = document.documentElement.classList.contains('dark')

    new ChartJS(canvas, {
      type: 'line',
      data: {
        labels: entries.map(([key]) => {
          const [, m] = key.split('-')
          return MONTHS[Number(m)]
        }),
        datasets: [{
          label: 'Spending',
          data: entries.map(([, v]) => v),
          borderColor: '#0d9488',
          backgroundColor: isDark ? 'rgba(13, 148, 136, 0.1)' : 'rgba(13, 148, 136, 0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0d9488',
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
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
  }, [monthlyTotals])

  const hasData = Object.values(monthlyTotals).some(v => v > 0)

  return (
    <Card title="6-Month Trend">
      <div className="relative flex-1 min-h-0">
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            <svg className="w-10 h-10 mb-2 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span>Not enough history</span>
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </Card>
  )
}
