const avgByPar = [
  { par: 3, avg: 3.8, diff: 0.8 },
  { par: 4, avg: 4.9, diff: 0.9 },
  { par: 5, avg: 5.7, diff: 0.7 },
]

const bestHoles = [
  { hole: 6,  par: 3, diff: 0.1 },
  { hole: 13, par: 5, diff: 0.3 },
  { hole: 2,  par: 5, diff: 0.4 },
]

const worstHoles = [
  { hole: 17, par: 4, diff: 1.6 },
  { hole: 10, par: 4, diff: 1.4 },
  { hole: 14, par: 4, diff: 1.2 },
]

const scoreTrend = [78, 82, 76, 85, 75, 80, 79, 83]

export default function Analytics() {
  const min = Math.min(...scoreTrend)
  const max = Math.max(...scoreTrend)
  const range = max - min || 1

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Based on 14 rounds · Handicap 12.4</p>
      </div>

      {/* Score trend */}
      <div className="bg-white border border-sand-300 rounded-lg p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Score Trend</h2>
        <div className="flex items-end gap-2 h-32">
          {scoreTrend.map((score, i) => {
            const heightPct = ((score - min + range * 0.15) / (range + range * 0.3)) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-gray-400 tabular-nums">{score}</span>
                <div
                  className="w-full rounded-t-sm bg-course-700 hover:bg-course-500 transition-colors cursor-default"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-300">
          <span>8 rounds ago</span>
          <span>Latest</span>
        </div>
      </div>

      {/* Par breakdown */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Average Score by Par</h2>
        <div className="grid grid-cols-3 divide-x divide-sand-300 border border-sand-300 rounded-lg overflow-hidden">
          {avgByPar.map(p => (
            <div key={p.par} className="bg-white px-5 py-5 text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Par {p.par}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{p.avg}</p>
              <p className="text-xs text-gray-400 mt-1">+{p.diff} avg</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best / Worst holes */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Strongest Holes</h2>
          <div className="bg-white border border-sand-300 rounded-lg overflow-hidden divide-y divide-sand-200">
            {bestHoles.map(h => (
              <div key={h.hole} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-medium text-gray-900">
                  Hole {h.hole}{' '}
                  <span className="text-gray-400 font-normal">· Par {h.par}</span>
                </span>
                <span className="text-sm tabular-nums font-semibold text-course-600">+{h.diff}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Needs Work</h2>
          <div className="bg-white border border-sand-300 rounded-lg overflow-hidden divide-y divide-sand-200">
            {worstHoles.map(h => (
              <div key={h.hole} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-medium text-gray-900">
                  Hole {h.hole}{' '}
                  <span className="text-gray-400 font-normal">· Par {h.par}</span>
                </span>
                <span className="text-sm tabular-nums font-semibold text-red-500">+{h.diff}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
