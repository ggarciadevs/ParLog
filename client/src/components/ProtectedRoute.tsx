import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
