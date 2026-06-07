import { useState } from 'react'

type HoleData = { hole: number; par: number; yards: number }

const FRONT: HoleData[] = [
  { hole: 1,  par: 4, yards: 380 },
  { hole: 2,  par: 5, yards: 502 },
  { hole: 3,  par: 3, yards: 156 },
  { hole: 4,  par: 4, yards: 325 },
  { hole: 5,  par: 4, yards: 455 },
  { hole: 6,  par: 3, yards: 162 },
  { hole: 7,  par: 4, yards: 430 },
  { hole: 8,  par: 5, yards: 490 },
  { hole: 9,  par: 4, yards: 465 },
]

const BACK: HoleData[] = [
  { hole: 10, par: 4, yards: 420 },
  { hole: 11, par: 4, yards: 415 },
  { hole: 12, par: 3, yards: 155 },
  { hole: 13, par: 5, yards: 510 },
  { hole: 14, par: 4, yards: 405 },
  { hole: 15, par: 5, yards: 530 },
  { hole: 16, par: 3, yards: 170 },
  { hole: 17, par: 4, yards: 445 },
  { hole: 18, par: 4, yards: 435 },
]

const ALL = [...FRONT, ...BACK]

type Scores = Record<number, number | null>

function sumPar(holes: HoleData[]) {
  return holes.reduce((a, h) => a + h.par, 0)
}

function sumYards(holes: HoleData[]) {
  return holes.reduce((a, h) => a + h.yards, 0)
}

function sumScore(holes: HoleData[], scores: Scores) {
  return holes.reduce((a, h) => {
    const s = scores[h.hole]
    return s != null ? a + s : a
  }, 0)
}

function scoresFilled(holes: HoleData[], scores: Scores) {
  return holes.some(h => scores[h.hole] != null)
}

function ScoreBadge({ score, par }: { score: number | null; par: number }) {
  if (score == null) return <span className="text-gray-300 text-xs">—</span>
  const diff = score - par
  let cls = 'inline-flex items-center justify-center w-7 h-7 text-xs font-bold tabular-nums '
  if (diff <= -2) cls += 'rounded-full ring-2 ring-yellow-400 text-yellow-700 bg-yellow-50'
  else if (diff === -1) cls += 'rounded-full ring-2 ring-red-500 text-red-700'
  else if (diff === 0) cls += 'text-gray-700'
  else if (diff === 1) cls += 'ring-1 ring-gray-400 text-gray-800'
  else cls += 'ring-2 ring-gray-600 bg-gray-100 text-gray-900'
  return <span className={cls}>{score}</span>
}

export default function Scorecard() {
  const [scores, setScores] = useState<Scores>(
    Object.fromEntries(ALL.map(h => [h.hole, null]))
  )

  const frontPar  = sumPar(FRONT)
  const backPar   = sumPar(BACK)
  const totalPar  = frontPar + backPar
  const frontScore = sumScore(FRONT, scores)
  const backScore  = sumScore(BACK, scores)
  const totalScore = frontScore + backScore
  const diff       = totalScore - totalPar
  const hasScores  = scoresFilled(ALL, scores)

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

  const thCls = 'py-2 px-2 font-semibold text-xs uppercase tracking-wider'
  const subtotalCls = 'py-2 px-3 bg-course-800 text-white font-bold text-xs'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Round</h1>
          <p className="text-sm text-gray-400 mt-1">Sample Course · Par {totalPar} · {sumYards(ALL).toLocaleString()} yds</p>
        </div>
        {hasScores && (
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
              {FRONT.map(h => <td key={h.hole} className={thCls}>{h.hole}</td>)}
              <td className={subtotalCls}>OUT</td>
              {BACK.map(h => <td key={h.hole} className={thCls}>{h.hole}</td>)}
              <td className={subtotalCls}>IN</td>
              <td className={subtotalCls}>TOT</td>
            </tr>
          </thead>
          <tbody>
            {/* Par */}
            <tr className="border-b border-sand-200 bg-course-100">
              <td className="py-2 px-3 text-left text-xs font-bold text-course-800 uppercase tracking-wider">Par</td>
              {FRONT.map(h => <td key={h.hole} className="py-2 px-2 text-xs font-semibold text-course-700">{h.par}</td>)}
              <td className="py-2 px-3 text-xs font-bold text-course-800 bg-course-100">{frontPar}</td>
              {BACK.map(h => <td key={h.hole} className="py-2 px-2 text-xs font-semibold text-course-700">{h.par}</td>)}
              <td className="py-2 px-3 text-xs font-bold text-course-800 bg-course-100">{backPar}</td>
              <td className="py-2 px-3 text-xs font-bold text-course-800 bg-course-100">{totalPar}</td>
            </tr>

            {/* Yards */}
            <tr className="border-b border-sand-200 bg-white">
              <td className="py-2 px-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Yds</td>
              {FRONT.map(h => <td key={h.hole} className="py-2 px-2 text-xs text-gray-400">{h.yards}</td>)}
              <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{sumYards(FRONT).toLocaleString()}</td>
              {BACK.map(h => <td key={h.hole} className="py-2 px-2 text-xs text-gray-400">{h.yards}</td>)}
              <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{sumYards(BACK).toLocaleString()}</td>
              <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-sand-50">{sumYards(ALL).toLocaleString()}</td>
            </tr>

            {/* Score input */}
            <tr className="bg-white">
              <td className="py-2 px-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Score</td>
              {FRONT.map(h => (
                <td key={h.hole} className="py-1.5 px-1">
                  <ScoreInput hole={h.hole} par={h.par} />
                </td>
              ))}
              <td className="py-2 px-3 font-bold text-sm text-gray-900 bg-sand-100 tabular-nums">
                {scoresFilled(FRONT, scores) ? frontScore : '—'}
              </td>
              {BACK.map(h => (
                <td key={h.hole} className="py-1.5 px-1">
                  <ScoreInput hole={h.hole} par={h.par} />
                </td>
              ))}
              <td className="py-2 px-3 font-bold text-sm text-gray-900 bg-sand-100 tabular-nums">
                {scoresFilled(BACK, scores) ? backScore : '—'}
              </td>
              <td className="py-2 px-3 font-bold text-sm text-gray-900 bg-sand-100 tabular-nums">
                {hasScores ? totalScore : '—'}
              </td>
            </tr>

            {/* Score badge row (visual indicators) */}
            <tr className="bg-sand-50 border-t border-sand-200">
              <td className="py-2 px-3 text-left text-xs text-gray-400"></td>
              {ALL.map((h, i) => (
                <>
                  {i === 9 && (
                    <td key="out-badge" className="py-2 px-3 bg-sand-100" />
                  )}
                  <td key={h.hole} className="py-2 px-1">
                    <ScoreBadge score={scores[h.hole]} par={h.par} />
                  </td>
                </>
              ))}
              <td className="py-2 px-3 bg-sand-100" />
              <td className="py-2 px-3 bg-sand-100" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <button className="w-full bg-course-700 text-white font-semibold py-3 rounded-md hover:bg-course-600 transition-colors text-sm tracking-wide">
        Save Round
      </button>
    </div>
  )
}
