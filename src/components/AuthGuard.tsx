import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingPage from '../pages/LoadingPage'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingPage />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
