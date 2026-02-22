import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expenses from './routes/expenses.js';
import recurring from './routes/recurring.js';
import categories from './routes/categories.js';
import users from './routes/users.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/expenses', expenses);
app.use('/api/recurring', recurring);
app.use('/api/categories', categories);
app.use('/api/users', users);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`SplitSmart API running at http://localhost:${PORT}`);
});
