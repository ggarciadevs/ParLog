import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AxiosError } from 'axios'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password)
      navigate('/')
    } catch (err) {
      const e = err as AxiosError<{ error: string }>
      setError(e.response?.data?.error ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col">
      <header className="bg-course-900">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <span className="text-white font-bold tracking-tight text-lg">
            Par<span className="text-flag">Log</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-400 mt-1">Start tracking your game</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-sand-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-course-600 placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-sand-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-course-600"
              />
              <p className="text-xs text-gray-400 mt-1.5">Minimum 8 characters</p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-flag text-white font-semibold py-2.5 rounded-md hover:brightness-105 transition text-sm disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-course-700 font-semibold hover:text-course-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
