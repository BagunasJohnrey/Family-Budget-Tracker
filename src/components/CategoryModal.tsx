import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORY_COLORS, type Category } from '../types'
import ConfirmModal from './ConfirmModal'

interface CategoryModalProps {
  open: boolean
  onClose: () => void
}

export default function CategoryModal({ open, onClose }: CategoryModalProps) {
  const { state, addCategory, editCategory, deleteCategoryAction } = useApp()
  const [name, setName] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [budget, setBudget] = useState('')
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEditing = editingCat !== null

  useEffect(() => {
    if (open) {
      resetForm()
      setEditingCat(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showEditConfirm || deleteConfirmId) return
        onClose()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, showEditConfirm, deleteConfirmId])

  function resetForm() {
    setName('')
    setColor(CATEGORY_COLORS[0])
    setBudget('')
  }

  function populateForm(cat: Category) {
    setEditingCat(cat)
    setName(cat.name)
    setColor(cat.color)
    setBudget(cat.budget != null ? String(cat.budget) : '')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function cancelEdit() {
    setEditingCat(null)
    resetForm()
    inputRef.current?.focus()
  }

  function handleSubmit() {
    if (!name.trim()) return
    setShowEditConfirm(true)
  }

  async function handleConfirmSubmit() {
    setShowEditConfirm(false)
    if (isEditing && editingCat) {
      await editCategory(editingCat.id, name.trim(), color, budget ? Number(budget) : null)
      setEditingCat(null)
      resetForm()
    } else {
      await addCategory(name.trim(), color, budget ? Number(budget) : null)
      resetForm()
    }
    inputRef.current?.focus()
  }

  function handleDeleteClick(catId: string) {
    setDeleteConfirmId(catId)
  }

  async function handleConfirmDelete() {
    if (deleteConfirmId) {
      await deleteCategoryAction(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/90" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-700 animate-slide-up-mobile sm:animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-none">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{isEditing ? 'Edit Category' : 'Category Settings'}</span>
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Add / Edit Category Form */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h4>
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. Food & Dining, Utilities, Rent"
                className="px-3 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Monthly Budget</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">₱</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7 pr-3.5 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Accent Color</label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {CATEGORY_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center outline-none hover:scale-110 hover:shadow-md"
                        style={{
                          backgroundColor: c,
                          borderColor: c === color ? '#1e293b' : 'transparent',
                          boxShadow: c === color ? `0 0 0 2px ${c}40` : 'none',
                        }}
                      >
                        {c === color && (
                          <svg className="w-3 h-3 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {isEditing && (
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition"
              >
                <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={isEditing ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                </svg>
                {isEditing ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Saved Categories
              </h4>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {state.categories.length}
              </span>
            </div>

            {state.categories.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                No categories yet. Add one above.
              </p>
            ) : (
              <div className="space-y-1.5">
                {state.categories.map(cat => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm group transition cursor-pointer ${
                      editingCat?.id === cat.id
                        ? 'bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-300 dark:ring-teal-700'
                        : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                    }`}
                    onClick={() => populateForm(cat)}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                        {cat.budget != null && cat.budget > 0 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">
                            ₱{cat.budget.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => populateForm(cat)}
                        className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition sm:opacity-0 sm:group-hover:opacity-100"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat.id)}
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
                        title="Delete category"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-5 py-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold rounded-xl text-sm transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Edit confirmation */}
      <ConfirmModal
        open={showEditConfirm}
        onClose={() => setShowEditConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title={isEditing ? 'Update Category?' : 'Add Category?'}
        message={
          isEditing
            ? `Save changes to "${name.trim()}"?`
            : `Create new category "${name.trim()}"?`
        }
        confirmLabel={isEditing ? 'Save' : 'Add'}
        icon={
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={isEditing ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
            </svg>
          </div>
        }
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message="This will permanently remove this category. Expenses using it will become uncategorized."
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
