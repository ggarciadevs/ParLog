import { Request, Response } from 'express';
import { registerUser, loginUser, signToken } from '../services/authService';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const user = await registerUser(email, password);
    const token = signToken(user.id, user.email);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const user = await loginUser(email, password);
    const token = signToken(user.id, user.email);
    res.cookie('token', token, COOKIE_OPTS);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
