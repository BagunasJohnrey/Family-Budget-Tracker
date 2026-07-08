import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import ControlBar from './components/ControlBar'
import SpendingChart from './components/SpendingChart'
import CategoryShareList from './components/CategoryShareList'
import TrendChart from './components/TrendChart'

import MemberChart from './components/MemberChart'
import ExpenseLedger from './components/ExpenseLedger'
import CategoryModal from './components/CategoryModal'
import ExpenseModal from './components/ExpenseModal'

import AuthGuard from './components/AuthGuard'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilesPage from './pages/ProfilesPage'

function Dashboard() {
  const { removeExpense } = useApp()
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null)

  const handleOpenCategoryModal = useCallback(() => setCategoryModalOpen(true), [])
  const handleCloseCategoryModal = useCallback(() => setCategoryModalOpen(false), [])
  const handleOpenExpenseModal = useCallback(() => {
    setEditExpenseId(null)
    setExpenseModalOpen(true)
  }, [])
  const handleCloseExpenseModal = useCallback(() => {
    setExpenseModalOpen(false)
    setEditExpenseId(null)
  }, [])

  const handleEditExpense = useCallback((id: string) => {
    setEditExpenseId(id)
    setExpenseModalOpen(true)
  }, [])

  const handleDeleteExpense = useCallback((id: string) => {
    removeExpense(id)
  }, [removeExpense])

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-none">
        <div className="space-y-4 sm:space-y-6">
          <SummaryCards />
          <ControlBar
            onOpenCategoryModal={handleOpenCategoryModal}
            onOpenExpenseModal={handleOpenExpenseModal}
          />
          <div className="flex flex-col lg:flex-row gap-4 xl:gap-6">
            <div className="lg:flex-[5] min-w-0 order-2 lg:order-1">
              <ExpenseLedger
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            </div>
            <div className="lg:flex-[4] min-w-0 order-1 lg:order-2 flex flex-col gap-4 xl:gap-6 h-full">
              <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                <TrendChart />
                <CategoryShareList />
              </div>
              <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                <SpendingChart />
                <MemberChart />
              </div>
            </div>
          </div>
        </div>
      </main>
      <CategoryModal open={categoryModalOpen} onClose={handleCloseCategoryModal} />
      <ExpenseModal
        open={expenseModalOpen}
        onClose={handleCloseExpenseModal}
        editExpenseId={editExpenseId}
      />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profiles" element={<AuthGuard><ProfilesPage /></AuthGuard>} />
      <Route path="/*" element={<AuthGuard><Dashboard /></AuthGuard>} />
    </Routes>
  )
}
