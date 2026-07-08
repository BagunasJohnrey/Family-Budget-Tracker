import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(num)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getTodayString(): string {
  return new Date().toISOString().substring(0, 10)
}

export function categoryExpenseTotal(expenses: { category_id: string; amount: number }[], categoryId: string): number {
  return expenses
    .filter(e => e.category_id === categoryId)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function downloadCSV(expenses: { title: string; amount: number; date: string; category: string; notes: string }[], filename = 'family-budget-export.csv') {
  const headers = ['Title', 'Amount', 'Date', 'Category', 'Notes']
  const rows = expenses.map(e => [
    `"${e.title.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    e.date,
    `"${e.category.replace(/"/g, '""')}"`,
    `"${e.notes.replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
