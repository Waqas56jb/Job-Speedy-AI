import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDbPool } from './pg.js';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import jobsRoutes from './jobsRoutes.js';
import applicationsRoutes from './applicationsRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api', jobsRoutes);
app.use('/api', applicationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'jobspeedy-ai-server', time: new Date().toISOString() });
});

app.get('/api/db-health', async (req, res) => {
  const pool = getDbPool();
  try {
    const result = await pool.query('select 1 as ok');
    res.json({ status: 'ok', result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});


