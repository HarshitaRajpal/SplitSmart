import { Router } from 'express';
import { pool } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get or create default user (for demo; no real auth)
router.post('/ensure', async (req, res) => {
  try {
    const { name, email } = req.body;
    let query = 'SELECT * FROM users WHERE email = $1';
    let params = [email || 'default@splitsmart.local'];
    const { rows: existing } = await pool.query(query, params);
    if (existing.length > 0) {
      return res.json(existing[0]);
    }
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
      [id, name || 'Me', email || 'default@splitsmart.local']
    );
    const { rows: created } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
