import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *`,
      [name, icon || '📌', color || '#636e72']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Category name already exists' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    const updates = [];
    const values = [];
    let i = 1;
    if (name != null) { updates.push(`name = $${i++}`); values.push(name); }
    if (icon != null) { updates.push(`icon = $${i++}`); values.push(icon); }
    if (color != null) { updates.push(`color = $${i++}`); values.push(color); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Category name already exists' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: used } = await pool.query('SELECT 1 FROM expenses WHERE category_id = $1 LIMIT 1', [id]);
    if (used.length > 0) return res.status(400).json({ error: 'Category is in use by expenses. Remove or reassign them first.' });
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Category not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
