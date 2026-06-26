import pool from './index';

export async function runSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rounds (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_name VARCHAR(255) NOT NULL,
      total_par INTEGER NOT NULL,
      total_score INTEGER NOT NULL DEFAULT 0,
      course_rating NUMERIC(4,1) NOT NULL DEFAULT 72.0,
      slope_rating INTEGER NOT NULL DEFAULT 113,
      played_at DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add columns if upgrading from an older schema
  await pool.query(`ALTER TABLE rounds ADD COLUMN IF NOT EXISTS total_score INTEGER NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE rounds ADD COLUMN IF NOT EXISTS course_rating NUMERIC(4,1) NOT NULL DEFAULT 72.0`);
  await pool.query(`ALTER TABLE rounds ADD COLUMN IF NOT EXISTS slope_rating INTEGER NOT NULL DEFAULT 113`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hole_scores (
      id SERIAL PRIMARY KEY,
      round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
      hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
      par INTEGER NOT NULL,
      yards INTEGER NOT NULL,
      score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 15)
    )
  `);

  console.log('Schema ready');
}
