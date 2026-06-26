import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  const link = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-flag font-semibold' : 'text-green-300 hover:text-white transition-colors'

  return (
    <div className="min-h-screen bg-sand-100">
      <header className="bg-course-900 border-b border-course-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-white font-bold tracking-tight text-lg">
            Par<span className="text-flag">Log</span>
          </span>
          <div className="flex items-center gap-8">
            <nav className="flex gap-8 text-sm">
              <NavLink to="/" end className={link}>Dashboard</NavLink>
              <NavLink to="/scorecard" className={link}>New Round</NavLink>
              <NavLink to="/analytics" className={link}>Analytics</NavLink>
            </nav>
            <div className="flex items-center gap-4 border-l border-course-800 pl-8">
              <span className="text-xs text-green-400 hidden sm:block">{user?.email}</span>
              <button
                onClick={logout}
                className="text-xs text-green-300 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
