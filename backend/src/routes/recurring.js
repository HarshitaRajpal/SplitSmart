import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = `
      SELECT r.*, c.name AS category_name, c.icon, c.color AS category_color
      FROM recurring_expenses r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE ($1::uuid IS NULL OR r.user_id = $1)
      ORDER BY r.next_due ASC
    `;
    const { rows } = await pool.query(query, [userId || null]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, amount, currency, title, category_id, note, frequency, next_due } = req.body;
    const query = `
      INSERT INTO recurring_expenses (user_id, amount, currency, title, category_id, note, frequency, next_due)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      user_id || null,
      amount,
      currency || 'INR',
      title,
      category_id || null,
      note || null,
      frequency,
      next_due || new Date().toISOString().slice(0, 10),
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, title, category_id, note, frequency, next_due, is_active } = req.body;
    const updates = [];
    const values = [];
    let i = 1;
    if (amount != null) { updates.push(`amount = $${i++}`); values.push(amount); }
    if (currency != null) { updates.push(`currency = $${i++}`); values.push(currency); }
    if (title != null) { updates.push(`title = $${i++}`); values.push(title); }
    if (category_id != null) { updates.push(`category_id = $${i++}`); values.push(category_id); }
    if (note != null) { updates.push(`note = $${i++}`); values.push(note); }
    if (frequency != null) { updates.push(`frequency = $${i++}`); values.push(frequency); }
    if (next_due != null) { updates.push(`next_due = $${i++}`); values.push(next_due); }
    if (is_active != null) { updates.push(`is_active = $${i++}`); values.push(is_active); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const query = `UPDATE recurring_expenses SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Recurring expense not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM recurring_expenses WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Recurring expense not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
