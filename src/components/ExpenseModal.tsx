import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getTodayString } from '../lib/utils'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  editExpenseId: string | null
}

export default function ExpenseModal({ open, onClose, editExpenseId }: ExpenseModalProps) {
  const { state, addExpense, editExpense, addMember, memberNames } = useApp()
  const isEditing = editExpenseId !== null

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(getTodayString())
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [memberName, setMemberName] = useState(memberNames[0] ?? '')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      resetForm()
      return
    }
    if (editExpenseId) {
      const exp = state.expenses.find(e => e.id === editExpenseId)
      if (exp) {
        setTitle(exp.title)
        setAmount(String(exp.amount))
        setCategoryId(exp.category_id)
        setDate(exp.date)
        setNotes(exp.notes ?? '')
        setIsRecurring(exp.is_recurring ?? false)
        setMemberName(exp.member_name ?? memberNames[0] ?? '')
      }
    } else {
      setDate(getTodayString())
      setMemberName(memberNames[0] ?? '')
    }
    if (state.categories.length > 0 && !editExpenseId) {
      setCategoryId(state.categories[0].id)
    }
  }, [open, editExpenseId, state.expenses, state.categories, memberNames])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  function resetForm() {
    setTitle('')
    setAmount('')
    setCategoryId(state.categories[0]?.id ?? '')
    setDate(getTodayString())
    setNotes('')
    setIsRecurring(false)
    setMemberName(memberNames[0] ?? '')
    setShowAddMember(false)
    setNewMemberName('')
    setSaving(false)
  }

  async function handleSubmit() {
    if (!title.trim() || !amount || !categoryId || !date) return

    const numAmount = Number(amount)
    if (numAmount <= 0) return

    setSaving(true)
    try {
      if (isEditing && editExpenseId) {
        await editExpense(editExpenseId, {
          title: title.trim(),
          amount: numAmount,
          category_id: categoryId,
          date,
          notes: notes.trim(),
          is_recurring: isRecurring,
          member_name: memberName,
        })
      } else {
        await addExpense({
          title: title.trim(),
          amount: numAmount,
          category_id: categoryId,
          date,
          notes: notes.trim(),
          is_recurring: isRecurring,
          member_name: memberName,
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/90" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-700 animate-slide-up-mobile sm:animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-7-7 7M12 3v12" />
            </svg>
            <span>{isEditing ? 'Edit Transaction' : 'Record Expense'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="py-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Jollibee, Electric Bill, Grocery Run"
              className="px-3.5 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Amount (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">₱</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-7 pr-3.5 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="px-3.5 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium transition-all"
              >
                {state.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-3.5 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Recurring Transaction</span>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isRecurring ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isRecurring ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Paid By</label>
            <div className="flex gap-2">
              {showAddMember ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newMemberName.trim()) {
                        addMember(newMemberName.trim())
                        setMemberName(newMemberName.trim())
                        setShowAddMember(false)
                        setNewMemberName('')
                      }
                      if (e.key === 'Escape') {
                        setShowAddMember(false)
                        setNewMemberName('')
                      }
                    }}
                    placeholder="Enter member name..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newMemberName.trim()) {
                        addMember(newMemberName.trim())
                        setMemberName(newMemberName.trim())
                        setShowAddMember(false)
                        setNewMemberName('')
                      }
                    }}
                    className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddMember(false); setNewMemberName('') }}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={memberName}
                  onChange={e => {
                    if (e.target.value === '__add__') {
                      setShowAddMember(true)
                    } else {
                      setMemberName(e.target.value)
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium transition-all"
                >
                  {memberNames.length === 0 && <option value="">Select person</option>}
                  {memberNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="__add__">+ Add new member</option>
                </select>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Store details, payment method, etc..."
              className="px-3.5 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold rounded-xl text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !amount || Number(amount) <= 0 || !categoryId || !date || saving}
            className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition shadow-sm inline-flex items-center space-x-1.5"
          >
            {saving && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span>{saving ? 'Saving...' : isEditing ? 'Update' : 'Save Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
