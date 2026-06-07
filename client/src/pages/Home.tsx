import { Link } from 'react-router-dom'

const stats = [
  { label: 'Handicap Index', value: '12.4', sub: 'Updated Jun 3' },
  { label: 'Best Round', value: '+3', sub: 'Pebble Beach, May 12' },
  { label: 'Rounds Played', value: '14', sub: 'This year' },
]

const recentRounds = [
  { id: 1, date: 'Jun 3',  course: 'Pebble Beach GL',       score: 78, toPar: 6  },
  { id: 2, date: 'May 28', course: 'Torrey Pines (South)',   score: 82, toPar: 10 },
  { id: 3, date: 'May 21', course: 'Riviera CC',             score: 76, toPar: 4  },
  { id: 4, date: 'May 14', course: 'Bethpage Black',         score: 85, toPar: 15 },
  { id: 5, date: 'May 12', course: 'Pebble Beach GL',        score: 75, toPar: 3  },
]

export default function Home() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Saturday, June 7, 2026</p>
      </div>

      {/* Stat blocks */}
      <div className="grid grid-cols-3 divide-x divide-sand-300 border border-sand-300 rounded-lg overflow-hidden">
        {stats.map(s => (
          <div key={s.label} className="bg-white px-6 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-4xl font-bold text-course-700 mt-2 tabular-nums">{s.value}</p>
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
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent Rounds</h2>
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
              {recentRounds.map(r => (
                <tr key={r.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400">{r.date}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{r.course}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-gray-900">{r.score}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">
                    <span className={r.toPar <= 5 ? 'text-course-600 font-semibold' : 'text-gray-500'}>
                      +{r.toPar}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
