import { pool } from './pool.js';

async function seed() {
  const client = await pool.connect();
  try {
    let { rows: users } = await client.query("SELECT id FROM users WHERE email = 'demo@splitsmart.local'");
    if (users.length === 0) {
      const r = await client.query(
        "INSERT INTO users (name, email) VALUES ('Demo User', 'demo@splitsmart.local') RETURNING id"
      );
      users = r.rows;
    }
    const userId = users[0]?.id;
    if (!userId) return console.log('No user to seed.');
    const { rows: cats } = await client.query('SELECT id FROM categories LIMIT 4');
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 2);
      await client.query(
        `INSERT INTO expenses (user_id, amount, title, category_id, expense_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 100 + Math.floor(Math.random() * 500), `Sample expense ${i + 1}`, cats[i % cats.length]?.id, d.toISOString().slice(0, 10)]
      );
    }
    console.log('Seed data added.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
