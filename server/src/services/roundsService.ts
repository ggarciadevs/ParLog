import pool from '../db/index';

type HoleInput = {
  hole_number: number
  par: number
  yards: number
  score: number
}

export async function saveRound(
  userId: number,
  courseName: string,
  totalPar: number,
  courseRating: number,
  slopeRating: number,
  playedAt: string,
  holes: HoleInput[]
) {
  const totalScore = holes.reduce((a, h) => a + h.score, 0);

  const roundRes = await pool.query(
    `INSERT INTO rounds (user_id, course_name, total_par, total_score, course_rating, slope_rating, played_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [userId, courseName, totalPar, totalScore, courseRating, slopeRating, playedAt]
  );
  const roundId = roundRes.rows[0].id as number;

  for (const hole of holes) {
    await pool.query(
      `INSERT INTO hole_scores (round_id, hole_number, par, yards, score)
       VALUES ($1, $2, $3, $4, $5)`,
      [roundId, hole.hole_number, hole.par, hole.yards, hole.score]
    );
  }

  return roundId;
}

export async function getRounds(userId: number) {
  const res = await pool.query(
    `SELECT id, course_name, total_par, total_score, course_rating, slope_rating, played_at
     FROM rounds WHERE user_id = $1 ORDER BY played_at DESC LIMIT 20`,
    [userId]
  );
  return res.rows;
}

export async function getStats(userId: number) {
  const res = await pool.query(
    `SELECT total_score, total_par, course_rating, slope_rating
     FROM rounds WHERE user_id = $1 ORDER BY played_at DESC LIMIT 20`,
    [userId]
  );
  const rounds = res.rows;
  if (rounds.length === 0) return { handicap: null, bestToPar: null, roundsPlayed: 0 };

  // USGA handicap differential = (score - course_rating) * 113 / slope_rating
  const differentials = rounds.map(r =>
    ((r.total_score - r.course_rating) * 113) / r.slope_rating
  );

  const take = Math.min(8, Math.max(1, Math.floor(rounds.length / 2)));
  const best = [...differentials].sort((a, b) => a - b).slice(0, take);
  const handicap = (best.reduce((a, b) => a + b, 0) / take) * 0.96;

  const bestToPar = Math.min(...rounds.map(r => r.total_score - r.total_par));

  return {
    handicap: Math.round(handicap * 10) / 10,
    bestToPar,
    roundsPlayed: rounds.length,
  };
}
