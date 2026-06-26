import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { ApiCourse, ApiTee, ScorecardHole } from '../types/course'

const TEE_COLOR: Record<string, string> = {
  blue:   'bg-blue-500',
  gold:   'bg-yellow-400',
  white:  'bg-gray-100 border border-gray-300',
  green:  'bg-green-500',
  red:    'bg-red-500',
  black:  'bg-gray-900',
}

function teeColor(name: string) {
  return TEE_COLOR[name.toLowerCase()] ?? 'bg-gray-400'
}

export default function CourseSelect() {
  const [query, setQuery]       = useState('')
  const [courses, setCourses]   = useState<ApiCourse[]>([])
  const [selected, setSelected] = useState<ApiCourse | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate                = useNavigate()

  useEffect(() => {
    if (query.trim().length < 2) { setCourses([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get<{ courses: ApiCourse[] }>(`/api/courses/search?q=${encodeURIComponent(query)}`)
        setCourses(res.data.courses)
      } catch {
        setError('Search failed — try again.')
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query])

  function selectTee(tee: ApiTee) {
    if (!selected) return
    const holes: ScorecardHole[] = tee.holes.map((h, i) => ({
      hole_number: i + 1,
      par: h.par,
      yards: h.yardage,
      handicap: h.handicap,
    }))
    navigate('/scorecard/play', {
      state: {
        courseName: selected.club_name,
        tee: tee.tee_name,
        courseRating: tee.course_rating,
        slopeRating: tee.slope_rating,
        parTotal: tee.par_total,
        holes,
      },
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">New Round</h1>
        <p className="text-sm text-gray-400 mt-1">Search for a course to get started</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setSelected(null); setQuery(e.target.value) }}
          placeholder="Search course name..."
          autoFocus
          className="w-full px-4 py-3 border border-sand-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-course-600 placeholder:text-gray-300"
        />
        {loading && (
          <span className="absolute right-4 top-3.5 text-xs text-gray-400">Searching...</span>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Results */}
      {!selected && courses.length > 0 && (
        <div className="bg-white border border-sand-300 rounded-lg overflow-hidden divide-y divide-sand-200">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelected(course)}
              className="w-full text-left px-5 py-4 hover:bg-sand-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{course.club_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {course.location.city}, {course.location.state}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Tee selection */}
      {selected && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{selected.club_name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {selected.location.city}, {selected.location.state}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Change course
            </button>
          </div>

          {selected.tees.male.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Men's Tees
              </h3>
              <div className="bg-white border border-sand-300 rounded-lg overflow-hidden divide-y divide-sand-200">
                {selected.tees.male.map(tee => (
                  <button
                    key={tee.tee_name}
                    onClick={() => selectTee(tee)}
                    className="w-full text-left px-5 py-4 hover:bg-sand-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${teeColor(tee.tee_name)}`} />
                      <span className="text-sm font-medium text-gray-900">{tee.tee_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-700">
                        {tee.total_yards.toLocaleString()} yds · Par {tee.par_total}
                      </p>
                      <p className="text-xs text-gray-400">
                        Rating {tee.course_rating} / Slope {tee.slope_rating}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected.tees.female.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Women's Tees
              </h3>
              <div className="bg-white border border-sand-300 rounded-lg overflow-hidden divide-y divide-sand-200">
                {selected.tees.female.map(tee => (
                  <button
                    key={tee.tee_name}
                    onClick={() => selectTee(tee)}
                    className="w-full text-left px-5 py-4 hover:bg-sand-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${teeColor(tee.tee_name)}`} />
                      <span className="text-sm font-medium text-gray-900">{tee.tee_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-700">
                        {tee.total_yards.toLocaleString()} yds · Par {tee.par_total}
                      </p>
                      <p className="text-xs text-gray-400">
                        Rating {tee.course_rating} / Slope {tee.slope_rating}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
