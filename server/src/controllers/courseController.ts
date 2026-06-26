import { Request, Response } from 'express';
import { searchCourses } from '../services/courseService';

export async function search(req: Request, res: Response) {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters' });
    return;
  }
  try {
    const courses = await searchCourses(q.trim());
    res.json({ courses });
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}
