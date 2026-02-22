import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/splitsmart',
});

const sql = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'tags') THEN
    ALTER TABLE expenses ADD COLUMN tags TEXT;
  END IF;
END $$;
`;

async function run() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Added tags column to expenses (or it already existed).');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
