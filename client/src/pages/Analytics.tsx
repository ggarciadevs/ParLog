import { useEffect, useState } from 'react'
import api from '../services/api'

type TrendRound = { id: number; course_name: string; total_score: number; total_par: number; played_at: string }
type ParRow     = { par: number; avg_score: string; holes_played: string }
type SummaryRound = { id: number; course_name: string; total_score: number; total_par: number; played_at: string }

type AnalyticsData = {
  trend: TrendRound[]
  parBreakdown: ParRow[]
  bestRounds: SummaryRound[]
  worstRounds: SummaryRound[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TrendChart({ rounds }: { rounds: TrendRound[] }) {
  if (rounds.length < 2) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Play at least 2 rounds to see your trend.
      </p>
    )
  }

  const diffs = rounds.map(r => r.total_score - r.total_par)
  const maxD  = Math.max(...diffs)
  const minD  = Math.min(...diffs)
  const pad   = Math.max((maxD - minD) * 0.25, 3)
  const yMax  = maxD + pad
  const yMin  = minD - pad
  const yRange = yMax - yMin

  const W = 600, H = 150
  const pL = 32, pR = 20, pT = 32, pB = 28
  const plotW = W - pL - pR
  const plotH = H - pT - pB

  const xOf = (i: number) => pL + (i / (rounds.length - 1)) * plotW
  const yOf = (d: number) => pT + ((yMax - d) / yRange) * plotH

  const polyPoints = diffs.map((d, i) => `${xOf(i)},${yOf(d)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Par line (zero) */}
      {yOf(0) >= pT && yOf(0) <= pT + plotH && (
        <>
          <line x1={pL} y1={yOf(0)} x2={W - pR} y2={yOf(0)}
            stroke="#ddd3c0" strokeWidth="1" strokeDasharray="4 3" />
          <text x={pL - 4} y={yOf(0) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">E</text>
        </>
      )}

      {/* Trend line */}
      <polyline points={polyPoints} fill="none"
        stroke="#1b4332" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Points + labels */}
      {diffs.map((diff, i) => {
        const cx = xOf(i)
        const cy = yOf(diff)
        const good = diff <= 0
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="4.5"
              fill={good ? '#2d6a4f' : '#9ca3af'} />
            <text x={cx} y={cy - 9} textAnchor="middle"
              fontSize="10" fontWeight="600"
              fill={good ? '#1b4332' : '#6b7280'}>
              {diff > 0 ? `+${diff}` : diff}
            </text>
            <text x={cx} y={H - 4} textAnchor="middle"
              fontSize="9" fill="#9ca3af">
              {formatDate(rounds[i].played_at)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Analytics() {
  const [data, setData]     = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AnalyticsData>('/api/rounds/analytics')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  const hasData = !loading && data && data.trend.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Track your improvement over time</p>
        </div>
        <div className="bg-white border border-sand-300 rounded-lg px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No rounds yet</p>
          <p className="text-xs text-gray-400 mt-1">Save a round to start seeing your analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Based on {data.trend.length} round{data.trend.length > 1 ? 's' : ''}</p>
      </div>

      {/* Score trend */}
      <div className="bg-white border border-sand-300 rounded-lg p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Score vs Par — Recent Rounds
        </h2>
        <TrendChart rounds={data.trend} />
      </div>

      {/* Par breakdown */}
      {data.parBreakdown.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Average Score by Par
          </h2>
          <div className="grid grid-cols-3 divide-x divide-sand-300 border border-sand-300 rounded-lg overflow-hidden">
            {data.parBreakdown.map(p => {
              const avg  = parseFloat(p.avg_score)
              const diff = avg - p.par
              return (
                <div key={p.par} className="bg-white px-5 py-5 text-center">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Par {p.par}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{avg.toFixed(1)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} avg · {p.holes_played} holes
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Best & Worst rounds */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Best Rounds</h2>
          <div className="space-y-3">
            {data.bestRounds.map(r => {
              const toPar = r.total_score - r.total_par
              return (
                <div key={r.id} className="bg-white border border-sand-300 rounded-lg px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.course_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.played_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums text-course-700">{r.total_score}</p>
                      <p className="text-xs font-semibold text-course-600">
                        {toPar > 0 ? `+${toPar}` : toPar}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Worst Rounds</h2>
          <div className="space-y-3">
            {data.worstRounds.map(r => {
              const toPar = r.total_score - r.total_par
              return (
                <div key={r.id} className="bg-white border border-sand-300 rounded-lg px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.course_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.played_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums text-gray-700">{r.total_score}</p>
                      <p className="text-xs font-semibold text-gray-500">+{toPar}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
