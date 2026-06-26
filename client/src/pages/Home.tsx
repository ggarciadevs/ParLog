import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import RoundModal from '../components/RoundModal'

type Round = {
  id: number
  course_name: string
  total_par: number
  total_score: number
  played_at: string
}

type Stats = {
  handicap: number | null
  bestToPar: number | null
  roundsPlayed: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Home() {
  const [rounds, setRounds]         = useState<Round[]>([])
  const [stats, setStats]           = useState<Stats | null>(null)
  const [loading, setLoading]       = useState(true)
  const [selectedRound, setSelected] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<{ rounds: Round[] }>('/api/rounds'),
      api.get<Stats>('/api/rounds/stats'),
    ]).then(([roundsRes, statsRes]) => {
      setRounds(roundsRes.data.rounds)
      setStats(statsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const statBlocks = [
    {
      label: 'Handicap Index',
      value: stats?.handicap != null ? String(stats.handicap) : '—',
      sub: stats?.roundsPlayed ? `Based on ${stats.roundsPlayed} round${stats.roundsPlayed > 1 ? 's' : ''}` : 'No rounds yet',
    },
    {
      label: 'Best Round',
      value: stats?.bestToPar != null
        ? (stats.bestToPar > 0 ? `+${stats.bestToPar}` : String(stats.bestToPar))
        : '—',
      sub: 'To par',
    },
    {
      label: 'Rounds Played',
      value: stats?.roundsPlayed != null ? String(stats.roundsPlayed) : '—',
      sub: 'All time',
    },
  ]

  return (
    <>
      {selectedRound && (
        <RoundModal roundId={selectedRound} onClose={() => setSelected(null)} />
      )}

      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-sand-300 border border-sand-300 rounded-lg overflow-hidden">
          {statBlocks.map(s => (
            <div key={s.label} className="bg-white px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-4xl font-bold text-course-700 mt-2 tabular-nums">
                {loading ? '—' : s.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/scorecard"
          className="flex items-center justify-center gap-2 w-full bg-flag text-white font-semibold py-3 rounded-md hover:brightness-105 transition text-sm"
        >
          <span className="text-base leading-none">+</span> Start New Round
        </Link>

        {/* Recent rounds */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Recent Rounds
          </h2>

          {loading ? (
            <div className="bg-white border border-sand-300 rounded-lg px-5 py-8 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : rounds.length === 0 ? (
            <div className="bg-white border border-sand-300 rounded-lg px-5 py-10 text-center">
              <p className="text-sm text-gray-500 font-medium">No rounds yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new round to see your history here.</p>
            </div>
          ) : (
            <div className="bg-white border border-sand-300 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-200 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Date</th>
                    <th className="text-left px-5 py-3 font-semibold">Course</th>
                    <th className="text-right px-5 py-3 font-semibold">Score</th>
                    <th className="text-right px-5 py-3 font-semibold">+/−</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {rounds.map(r => {
                    const toPar = r.total_score - r.total_par
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r.id)}
                        className="hover:bg-sand-50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 text-gray-400">{formatDate(r.played_at)}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{r.course_name}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-gray-900">
                          {r.total_score}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span className={toPar <= 0 ? 'text-course-600 font-semibold' : 'text-gray-500'}>
                            {toPar > 0 ? `+${toPar}` : toPar}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
