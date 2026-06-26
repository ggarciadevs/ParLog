import { useEffect, useState } from 'react'
import api from '../services/api'

type Hole = { hole_number: number; par: number; yards: number; score: number }
type RoundDetail = {
  id: number
  course_name: string
  total_par: number
  total_score: number
  course_rating: number
  slope_rating: number
  played_at: string
  holes: Hole[]
}

function ScoreBadge({ score, par }: { score: number; par: number }) {
  const diff = score - par
  let cls = 'inline-flex items-center justify-center w-7 h-7 text-xs font-bold tabular-nums '
  if (diff <= -2)   cls += 'rounded-full ring-2 ring-yellow-400 text-yellow-700 bg-yellow-50'
  else if (diff === -1) cls += 'rounded-full ring-2 ring-red-500 text-red-700'
  else if (diff === 0)  cls += 'text-gray-700'
  else if (diff === 1)  cls += 'ring-1 ring-gray-400 text-gray-800'
  else                  cls += 'ring-2 ring-gray-600 bg-gray-100 text-gray-900'
  return <span className={cls}>{score}</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function RoundModal({ roundId, onClose }: { roundId: number; onClose: () => void }) {
  const [round, setRound] = useState<RoundDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ round: RoundDetail }>(`/api/rounds/${roundId}`)
      .then(res => setRound(res.data.round))
      .finally(() => setLoading(false))
  }, [roundId])

  const front = round?.holes.slice(0, 9) ?? []
  const back  = round?.holes.slice(9, 18) ?? []
  const diff  = round ? round.total_score - round.total_par : 0

  const thCls       = 'py-2 px-2 font-semibold text-xs uppercase tracking-wider'
  const subtotalCls = 'py-2 px-3 bg-course-800 text-white font-bold text-xs'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-sand-200">
          <div>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : round ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">{round.course_name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{formatDate(round.played_at)}</p>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-6">
            {round && (
              <div className="text-right">
                <p className="text-3xl font-bold tabular-nums text-course-700">{round.total_score}</p>
                <p className={`text-sm font-semibold ${diff > 0 ? 'text-gray-500' : 'text-course-600'}`}>
                  {diff > 0 ? `+${diff}` : diff} to par
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scorecard */}
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Loading scorecard...</div>
        ) : round ? (
          <div className="overflow-x-auto p-6">
            <table className="text-center w-full min-w-[760px] border-collapse rounded-lg overflow-hidden border border-sand-300">
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
                  <td className="py-2 px-3 text-xs font-bold text-course-800">{front.reduce((a, h) => a + h.par, 0)}</td>
                  {back.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs font-semibold text-course-700">{h.par}</td>)}
                  <td className="py-2 px-3 text-xs font-bold text-course-800">{back.reduce((a, h) => a + h.par, 0)}</td>
                  <td className="py-2 px-3 text-xs font-bold text-course-800">{round.total_par}</td>
                </tr>

                {/* Yards */}
                <tr className="border-b border-sand-200 bg-white">
                  <td className="py-2 px-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Yds</td>
                  {front.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs text-gray-400">{h.yards}</td>)}
                  <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{front.reduce((a, h) => a + h.yards, 0).toLocaleString()}</td>
                  {back.map(h => <td key={h.hole_number} className="py-2 px-2 text-xs text-gray-400">{h.yards}</td>)}
                  <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{back.reduce((a, h) => a + h.yards, 0).toLocaleString()}</td>
                  <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{round.holes.reduce((a, h) => a + h.yards, 0).toLocaleString()}</td>
                </tr>

                {/* Score */}
                <tr className="border-b border-sand-200 bg-white">
                  <td className="py-2 px-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Score</td>
                  {front.map(h => <td key={h.hole_number} className="py-2 px-2 text-sm font-bold tabular-nums text-gray-900">{h.score}</td>)}
                  <td className="py-2 px-3 font-bold text-sm bg-sand-100 tabular-nums">{front.reduce((a, h) => a + h.score, 0)}</td>
                  {back.map(h => <td key={h.hole_number} className="py-2 px-2 text-sm font-bold tabular-nums text-gray-900">{h.score}</td>)}
                  <td className="py-2 px-3 font-bold text-sm bg-sand-100 tabular-nums">{back.reduce((a, h) => a + h.score, 0)}</td>
                  <td className="py-2 px-3 font-bold text-sm bg-sand-100 tabular-nums">{round.total_score}</td>
                </tr>

                {/* Badges */}
                <tr className="bg-sand-50">
                  <td className="py-2 px-3" />
                  {front.map(h => <td key={h.hole_number} className="py-2 px-1"><ScoreBadge score={h.score} par={h.par} /></td>)}
                  <td className="py-2 px-3 bg-sand-100" />
                  {back.map(h => <td key={h.hole_number} className="py-2 px-1"><ScoreBadge score={h.score} par={h.par} /></td>)}
                  <td className="py-2 px-3 bg-sand-100" />
                  <td className="py-2 px-3 bg-sand-100" />
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Round not found.</div>
        )}
      </div>
    </div>
  )
}
