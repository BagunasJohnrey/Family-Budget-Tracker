import { useEffect, useRef, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import { useApp } from '../context/AppContext'
import Card from './Card'

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend)

const COLORS = ['#0d9488', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#ca8a04']

export default function MemberChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state, memberNames } = useApp()

  const memberTotals = useMemo(() => {
    const map: Record<string, number> = {}
    for (const name of memberNames) map[name] = 0
    for (const exp of state.expenses) {
      const d = new Date(exp.date + 'T00:00:00')
      if (d.getMonth() === state.filterMonth && d.getFullYear() === state.filterYear && exp.member_name) {
        map[exp.member_name] = (map[exp.member_name] ?? 0) + exp.amount
      }
    }
    return Object.fromEntries(Object.entries(map).filter(([, v]) => v > 0))
  }, [state.expenses, memberNames, state.filterMonth, state.filterYear])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ChartJS.getChart(canvas)?.destroy()

    const entries = Object.entries(memberTotals)
    if (entries.length === 0) return

    const isDark = document.documentElement.classList.contains('dark')

    new ChartJS(canvas, {
      type: 'doughnut',
      data: {
        labels: entries.map(([name]) => name),
        datasets: [{
          data: entries.map(([, v]) => v),
          backgroundColor: entries.map((_, i) => COLORS[i % COLORS.length]),
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
                return ` ${ctx.label}: ₱${value.toLocaleString()} (${pct}%)`
              },
            },
          },
        },
      },
    })

    return () => { ChartJS.getChart(canvas)?.destroy() }
  }, [memberTotals])

  const hasData = Object.keys(memberTotals).length > 0

  return (
    <Card title="Spending by Member">
      <div className="relative flex-1 min-h-0">
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            <svg className="w-10 h-10 mb-2 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>No member data</span>
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </Card>
  )
}
