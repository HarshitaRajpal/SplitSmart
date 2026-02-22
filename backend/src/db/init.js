import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/splitsmart',
});

const initSQL = `
-- Users (simple; can extend for auth later)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories for expenses
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(20)
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  title VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  note TEXT,
  tags TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring expense templates
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  title VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  note TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_expenses(next_due) WHERE is_active = true;

-- Add tags column if missing (existing DBs)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'tags') THEN
    ALTER TABLE expenses ADD COLUMN tags TEXT;
  END IF;
END $$;

-- Default categories (icon = emoji for display)
INSERT INTO categories (name, icon, color) VALUES
  ('Food & Dining', '🍔', '#ff6b6b'),
  ('Transport', '🚗', '#4ecdc4'),
  ('Shopping', '🛒', '#45b7d1'),
  ('Bills & Utilities', '💡', '#96ceb4'),
  ('Entertainment', '🎬', '#ffeaa7'),
  ('Health', '❤️', '#dfe6e9'),
  ('Travel', '✈️', '#fd79a8'),
  ('Education', '📚', '#a29bfe'),
  ('Other', '📌', '#636e72')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color;
`;

async function init() {
  const client = await pool.connect();
  try {
    await client.query(initSQL);
    console.log('Database initialized successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch((e) => {
  console.error('Init failed:', e);
  process.exit(1);
});
