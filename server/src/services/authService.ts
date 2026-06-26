import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index';

export async function registerUser(email: string, password: string) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Email already in use');

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, hash]
  );
  return result.rows[0] as { id: number; email: string };
}

export async function loginUser(email: string, password: string) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  // Same error message for both cases — don't leak which one failed
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) throw new Error('Invalid credentials');

  return { id: user.id as number, email: user.email as string };
}

export function signToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
