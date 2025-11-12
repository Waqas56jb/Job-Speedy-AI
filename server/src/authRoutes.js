import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDbPool } from './pg.js';

const router = Router();
const pool = getDbPool();

// POST /api/auth/register - registers a normal user
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email, password are required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'insert into users (full_name, email, password_hash) values ($1, $2, $3) returning id, full_name, email',
      [fullName, email.toLowerCase(), hashed]
    );
    res.status(201).json({ user: { id: result.rows[0].id, fullName: result.rows[0].full_name, email: result.rows[0].email } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - login for both admin and normal users
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const lower = email.toLowerCase();
    // Check admin first
    const adminRes = await pool.query('select id, email, password_hash from admin_users where email = $1', [lower]);
    if (adminRes.rowCount === 1) {
      const ok = await bcrypt.compare(password, adminRes.rows[0].password_hash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ role: 'admin', user: { id: adminRes.rows[0].id, email: adminRes.rows[0].email } });
    }

    // Check normal users
    const userRes = await pool.query('select id, full_name, email, password_hash from users where email = $1', [lower]);
    if (userRes.rowCount === 1) {
      const ok = await bcrypt.compare(password, userRes.rows[0].password_hash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ role: 'user', user: { id: userRes.rows[0].id, fullName: userRes.rows[0].full_name, email: userRes.rows[0].email } });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEV: seed or update an admin user easily
router.post('/seed-admin', async (req, res) => {
  if ((process.env.NODE_ENV || 'development') === 'production') {
    return res.status(403).json({ error: 'Disabled in production' });
  }
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const upsert = await pool.query(
      `insert into admin_users (email, password_hash)
       values ($1, $2)
       on conflict (email) do update set password_hash = excluded.password_hash
       returning id, email`,
      [email.toLowerCase(), hashed]
    );
    res.json({ ok: true, admin: upsert.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password - update password by email (users or admin_users)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body || {};
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'email and newPassword are required' });
    }

    const lower = String(email).toLowerCase();
    const hashed = await bcrypt.hash(String(newPassword), 10);

    // Update both tables to avoid mismatch (login checks admin first)
    const userUpd = await pool.query(
      'update users set password_hash = $1 where email = $2 returning id, email',
      [hashed, lower]
    );
    const adminUpd = await pool.query(
      'update admin_users set password_hash = $1 where email = $2 returning id, email',
      [hashed, lower]
    );

    if (userUpd.rowCount === 0 && adminUpd.rowCount === 0) {
      return res.status(404).json({ error: 'Email not registered' });
    }

    const roles = [];
    if (userUpd.rowCount > 0) roles.push('user');
    if (adminUpd.rowCount > 0) roles.push('admin');
    return res.json({ ok: true, roles, email: lower });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;


