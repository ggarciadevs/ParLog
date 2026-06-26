import { Request, Response } from 'express';
import { saveRound, getRounds, getStats, getRoundById, getAnalytics } from '../services/roundsService';

export async function create(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { course_name, total_par, course_rating, slope_rating, played_at, holes } =
    req.body as {
      course_name: string;
      total_par: number;
      course_rating: number;
      slope_rating: number;
      played_at: string;
      holes: { hole_number: number; par: number; yards: number; score: number }[];
    };

  if (!course_name || !holes || holes.length !== 18) {
    res.status(400).json({ error: 'Invalid round data' });
    return;
  }

  try {
    const id = await saveRound(userId, course_name, total_par, course_rating, slope_rating, played_at, holes);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const rounds = await getRounds(req.user!.userId);
    res.json({ rounds });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function stats(req: Request, res: Response) {
  try {
    const data = await getStats(req.user!.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function byId(req: Request, res: Response) {
  const roundId = parseInt(req.params.id);
  if (isNaN(roundId)) { res.status(400).json({ error: 'Invalid round id' }); return; }
  try {
    const round = await getRoundById(roundId, req.user!.userId);
    if (!round) { res.status(404).json({ error: 'Round not found' }); return; }
    res.json({ round });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function analytics(req: Request, res: Response) {
  try {
    const data = await getAnalytics(req.user!.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
