import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { ScorecardHole, ScorecardState } from '../types/course'

type Scores = Record<number, number | null>

function sumPar(holes: ScorecardHole[]) {
  return holes.reduce((a, h) => a + h.par, 0)
}

function sumYards(holes: ScorecardHole[]) {
  return holes.reduce((a, h) => a + h.yards, 0)
}

function sumScore(holes: ScorecardHole[], scores: Scores) {
  return holes.reduce((a, h) => {
    const s = scores[h.hole_number]
    return s != null ? a + s : a
  }, 0)
}

function hasAnyScore(holes: ScorecardHole[], scores: Scores) {
  return holes.some(h => scores[h.hole_number] != null)
}

function ScoreBadge({ score, par }: { score: number | null; par: number }) {
  if (score == null) return <span className="text-gray-300 text-xs">—</span>
  const diff = score - par
  let cls = 'inline-flex items-center justify-center w-7 h-7 text-xs font-bold tabular-nums '
  if (diff <= -2)   cls += 'rounded-full ring-2 ring-yellow-400 text-yellow-700 bg-yellow-50'
  else if (diff === -1) cls += 'rounded-full ring-2 ring-red-500 text-red-700'
  else if (diff === 0)  cls += 'text-gray-700'
  else if (diff === 1)  cls += 'ring-1 ring-gray-400 text-gray-800'
  else                  cls += 'ring-2 ring-gray-600 bg-gray-100 text-gray-900'
  return <span className={cls}>{score}</span>
}

export default function Scorecard() {
  const { state } = useLocation()

  if (!state?.holes) return <Navigate to="/scorecard" replace />

  const { courseName, tee, courseRating, slopeRating, parTotal, holes } =
    state as ScorecardState

  const front = holes.slice(0, 9)
  const back  = holes.slice(9, 18)

  const navigate = useNavigate()
  const [scores, setScores] = useState<Scores>(
    Object.fromEntries(holes.map(h => [h.hole_number, null]))
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const frontScore = sumScore(front, scores)
  const backScore  = sumScore(back, scores)
  const totalScore = frontScore + backScore
  const diff       = totalScore - parTotal
  const anyScore   = hasAnyScore(holes, scores)

  async function handleSave() {
    const incomplete = holes.some(h => scores[h.hole_number] == null)
    if (incomplete) { setSaveError('Enter a score for every hole before saving.'); return }

    setSaving(true)
    setSaveError('')
    try {
      await api.post('/api/rounds', {
        course_name: courseName,
        total_par: parTotal,
        course_rating: courseRating,
        slope_rating: slopeRating,
        played_at: new Date().toISOString().split('T')[0],
        holes: holes.map(h => ({ ...h, score: scores[h.hole_number] })),
      })
      navigate('/')
    } catch {
      setSaveError('Failed to save round. Try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleScore(hole: number, val: string) {
    const n = parseInt(val)
    setScores(prev => ({ ...prev, [hole]: isNaN(n) ? null : Math.max(1, Math.min(15, n)) }))
  }

  function ScoreInput({ hole, par }: { hole: number; par: number }) {
    return (
      <input
        type="number"
        min={1}
        max={15}
        value={scores[hole] ?? ''}
        onChange={e => handleScore(hole, e.target.value)}
        onFocus={e => e.target.select()}
        placeholder="·"
        className="w-8 h-8 text-center text-xs font-bold border border-sand-300 rounded bg-sand-50 focus:outline-none focus:ring-1 focus:ring-course-600 focus:bg-white tabular-nums placeholder:text-gray-300"
      />
    )
  }

  const thCls      = 'py-2 px-2 font-semibold text-xs uppercase tracking-wider'
  const subtotalCls = 'py-2 px-3 bg-course-800 text-white font-bold text-xs'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{courseName}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {tee} Tees · Par {parTotal} · Rating {courseRating} / Slope {slopeRating}
          </p>
        </div>
        {anyScore && (
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums text-course-700">{totalScore}</p>
            <p className={`text-sm font-semibold mt-0.5 ${diff > 0 ? 'text-gray-500' : 'text-course-600'}`}>
              {diff > 0 ? `+${diff}` : diff} to par
            </p>
          </div>
        )}
      </div>

      {/* Scorecard table */}
      <div className="overflow-x-auto rounded-lg border border-sand-300">
        <table className="text-center w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-course-900 text-white text-xs">
              <td className={`${thCls} text-left w-16 text-green-300`}>Hole</td>
              {front.map(h => <td key={h.hole_number} className={thCls}>{h.hole_number}</td>)}
              <td className={subtotalCls}>OUT</td>
              {back.map(h => <td key={h.hole_number} className={thCls}>{h.hole_number}</td>)}
              <td className={subtotalCls}>IN</td>
              <td className={subtotalCls}>TOT</td>
            </tr>
          </thead>
          <tbody>
            {/* Par */}
            <tr className="border-b border-sand-200 bg-course-100">
              <td className="py-2 px-3 text-left text-xs font-bold text-course-800 uppercase tracking-wider">Par</td>
              {front.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs font-semibold text-course-700">{h.par}</td>)}
              <td className="py-2 px-3 text-xs font-bold text-course-800">{sumPar(front)}</td>
              {back.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs font-semibold text-course-700">{h.par}</td>)}
              <td className="py-2 px-3 text-xs font-bold text-course-800">{sumPar(back)}</td>
              <td className="py-2 px-3 text-xs font-bold text-course-800">{parTotal}</td>
            </tr>

            {/* Yards */}
            <tr className="border-b border-sand-200 bg-white">
              <td className="py-2 px-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Yds</td>
              {front.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs text-gray-400">{h.yards}</td>)}
              <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{sumYards(front).toLocaleString()}</td>
              {back.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs text-gray-400">{h.yards}</td>)}
              <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{sumYards(back).toLocaleString()}</td>
              <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{sumYards(holes).toLocaleString()}</td>
            </tr>

            {/* Handicap */}
            <tr className="border-b border-sand-200 bg-white">
              <td className="py-2 px-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Hcp</td>
              {front.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs text-gray-400">{h.handicap}</td>)}
              <td className="py-2 px-3 bg-sand-50" />
              {back.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs text-gray-400">{h.handicap}</td>)}
              <td className="py-2 px-3 bg-sand-50" />
              <td className="py-2 px-3 bg-sand-50" />
            </tr>

            {/* Score input */}
            <tr className="bg-white">
              <td className="py-2 px-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Score</td>
              {front.map(h => (
                <td key={h.hole_number} className="py-1.5 px-1">
                  <ScoreInput hole={h.hole_number} par={h.par} />
                </td>
              ))}
              <td className="py-2 px-3 font-bold text-sm text-gray-900 bg-sand-100 tabular-nums">
                {hasAnyScore(front, scores) ? frontScore : '—'}
              </td>
              {back.map(h => (
                <td key={h.hole_number} className="py-1.5 px-1">
                  <ScoreInput hole={h.hole_number} par={h.par} />
                </td>
              ))}
              <td className="py-2 px-3 font-bold text-sm text-gray-900 bg-sand-100 tabular-nums">
                {hasAnyScore(back, scores) ? backScore : '—'}
              </td>
              <td className="py-2 px-3 font-bold text-sm text-gray-900 bg-sand-100 tabular-nums">
                {anyScore ? totalScore : '—'}
              </td>
            </tr>

            {/* Badge row */}
            <tr className="bg-sand-50 border-t border-sand-200">
              <td className="py-2 px-3" />
              {front.map(h => (
                <td key={h.hole_number} className="py-2 px-1">
                  <ScoreBadge score={scores[h.hole_number]} par={h.par} />
                </td>
              ))}
              <td className="py-2 px-3 bg-sand-100" />
              {back.map(h => (
                <td key={h.hole_number} className="py-2 px-1">
                  <ScoreBadge score={scores[h.hole_number]} par={h.par} />
                </td>
              ))}
              <td className="py-2 px-3 bg-sand-100" />
              <td className="py-2 px-3 bg-sand-100" />
            </tr>
          </tbody>
        </table>
      </div>

      {saveError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {saveError}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-course-700 text-white font-semibold py-3 rounded-md hover:bg-course-600 transition-colors text-sm tracking-wide disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Round'}
      </button>
    </div>
  )
}
