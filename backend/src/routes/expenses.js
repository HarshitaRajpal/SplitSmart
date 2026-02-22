import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// List expenses (optional: userId, month, year, limit)
router.get('/', async (req, res) => {
  try {
    const { userId, month, year, limit = 100 } = req.query;
    let query = `
      SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;
    if (userId) {
      query += ` AND e.user_id = $${i}`;
      params.push(userId);
      i++;
    }
    if (month) {
      query += ` AND EXTRACT(MONTH FROM e.expense_date) = $${i}`;
      params.push(parseInt(month, 10));
      i++;
    }
    if (year) {
      query += ` AND EXTRACT(YEAR FROM e.expense_date) = $${i}`;
      params.push(parseInt(year, 10));
      i++;
    }
    query += ` ORDER BY e.expense_date DESC, e.created_at DESC LIMIT $${i}`;
    params.push(parseInt(limit, 10) || 100);

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Monthly summary for charts
router.get('/summary', async (req, res) => {
  try {
    const { userId, year } = req.query;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const query = `
      SELECT
        EXTRACT(MONTH FROM expense_date) AS month,
        SUM(amount::numeric) AS total
      FROM expenses
      WHERE ($1::uuid IS NULL OR user_id = $1)
        AND EXTRACT(YEAR FROM expense_date) = $2
      GROUP BY EXTRACT(MONTH FROM expense_date)
      ORDER BY month
    `;
    const { rows } = await pool.query(query, [userId || null, y]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Category breakdown for a month
router.get('/by-category', async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const query = `
      SELECT c.name, c.color, SUM(e.amount::numeric) AS total
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE ($1::uuid IS NULL OR e.user_id = $1)
        AND EXTRACT(MONTH FROM e.expense_date) = $2
        AND EXTRACT(YEAR FROM e.expense_date) = $3
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `;
    const { rows } = await pool.query(query, [userId || null, m, y]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { user_id, amount, currency, title, category_id, note, tags, expense_date } = req.body;
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (typeof tags === 'string' ? tags : null);
    const query = `
      INSERT INTO expenses (user_id, amount, currency, title, category_id, note, tags, expense_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE))
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      user_id || null,
      amount,
      currency || 'INR',
      title,
      category_id || null,
      note || null,
      tagsStr || null,
      expense_date || null,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update expense
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, title, category_id, note, tags, expense_date } = req.body;
    const updates = [];
    const values = [];
    let i = 1;
    if (amount != null) { updates.push(`amount = $${i++}`); values.push(amount); }
    if (currency != null) { updates.push(`currency = $${i++}`); values.push(currency); }
    if (title != null) { updates.push(`title = $${i++}`); values.push(title); }
    if (category_id != null) { updates.push(`category_id = $${i++}`); values.push(category_id); }
    if (note != null) { updates.push(`note = $${i++}`); values.push(note); }
    if (tags !== undefined) {
      const tagsStr = Array.isArray(tags) ? tags.join(',') : (typeof tags === 'string' ? tags : null);
      updates.push(`tags = $${i++}`);
      values.push(tagsStr);
    }
    if (expense_date != null) { updates.push(`expense_date = $${i++}`); values.push(expense_date); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const query = `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Expense not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
