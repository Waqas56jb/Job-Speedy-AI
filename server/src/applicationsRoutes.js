import { Router } from 'express';
import multer from 'multer';
import { getDbPool } from './pg.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const pool = getDbPool();

router.post('/applications', upload.single('resume'), async (req, res) => {
  try {
    const { job_id, name, email, phone, user_id, user_email, ai_parsed_data } = req.body || {};
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    const jid = Number(job_id);
    if (!Number.isInteger(jid)) {
      return res.status(400).json({ error: 'job_id must be an integer' });
    }

    // Resolve user id
    let resolvedUserId = user_id ? Number(user_id) : null;
    let resolvedEmail = email || user_email || null;
    let resolvedName = name || null;

    if (!resolvedUserId && resolvedEmail) {
      const u = await pool.query('select id, full_name, email from users where email = $1', [String(resolvedEmail).toLowerCase()]);
      if (u.rowCount === 1) {
        resolvedUserId = u.rows[0].id;
        if (!resolvedName) resolvedName = u.rows[0].full_name || null;
        if (!resolvedEmail) resolvedEmail = u.rows[0].email || null;
      }
    }

    // If user_id provided, prefer DB name/email when not supplied
    if (resolvedUserId && (!resolvedName || !resolvedEmail)) {
      const u2 = await pool.query('select full_name, email from users where id = $1', [resolvedUserId]);
      if (u2.rowCount === 1) {
        if (!resolvedName) resolvedName = u2.rows[0].full_name || null;
        if (!resolvedEmail) resolvedEmail = u2.rows[0].email || null;
      }
    }

    // Parse ai_parsed_data JSON if present
    let parsedJson = null;
    if (ai_parsed_data) {
      try { parsedJson = JSON.parse(ai_parsed_data); } catch (_) { parsedJson = null; }
    }

    const params = [
      jid,
      resolvedUserId,
      resolvedName,
      resolvedEmail ? String(resolvedEmail).toLowerCase() : null,
      phone || null,
      req.file?.originalname || null,
      req.file?.mimetype || null,
      req.file?.buffer || null,
      parsedJson,
    ];

    // Upsert by (user_id, job_id) if user is known; else just insert new row
    let sql;
    if (resolvedUserId) {
      sql = `
        insert into applications (job_id, user_id, name, email, phone, resume_filename, resume_mime, resume_data, ai_parsed_data)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        on conflict (user_id, job_id) do update
          set name = coalesce(excluded.name, applications.name),
              email = coalesce(excluded.email, applications.email),
              phone = coalesce(excluded.phone, applications.phone),
              resume_filename = coalesce(excluded.resume_filename, applications.resume_filename),
              resume_mime = coalesce(excluded.resume_mime, applications.resume_mime),
              resume_data = coalesce(excluded.resume_data, applications.resume_data),
              ai_parsed_data = coalesce(excluded.ai_parsed_data, applications.ai_parsed_data),
              updated_at = now()
        returning id`;
    } else {
      sql = `
        insert into applications (job_id, name, email, phone, resume_filename, resume_mime, resume_data, ai_parsed_data)
        values ($1,$3,$4,$5,$6,$7,$8,$9)
        returning id`;
    }

    const result = await pool.query(sql, params);
    res.json({ applicationId: result.rows[0].id, userId: resolvedUserId || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;




