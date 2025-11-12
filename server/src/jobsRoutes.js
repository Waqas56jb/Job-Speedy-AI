import { Router } from 'express';
import { getDbPool } from './pg.js';

const router = Router();
const pool = getDbPool();

async function ensureSeeded() {
  const count = await pool.query('select count(*)::int as c from jobs');
  if ((count.rows[0]?.c || 0) === 0) {
    await pool.query(
      `insert into jobs (title, company, description, required_skills, location, job_type, category, language) values 
      ('Frontend Developer','TechNova','Build UI with React',ARRAY['React','HTML','CSS'],'Berlin','Full Time','Engineering','English'),
      ('Backend Developer','DataWorks','APIs with Node and Postgres',ARRAY['Node.js','PostgreSQL','Express'],'Munich','Full Time','Engineering','English'),
      ('Full Stack Developer','StackLab','End-to-end features',ARRAY['React','Node.js','SQL'],'Remote','Remote','Engineering','English'),
      ('AI Engineer','SmartHire','ML/NLP systems',ARRAY['Python','ML','NLP'],'Hamburg','Full Time','AI','English'),
      ('DevOps Engineer','CloudOps','Infra & CI/CD',ARRAY['Docker','AWS','CI/CD'],'Remote','Remote','Engineering','English')`
    );
  }
}

router.get('/jobs', async (req, res) => {
  try {
    await ensureSeeded();
    const { search = '', location = '', type = '', category = '', language = '' } = req.query;
    const params = [];
    const conds = [];
    if (search) { params.push(`%${search}%`); conds.push(`(title ilike $${params.length} or description ilike $${params.length})`); }
    if (location) { params.push(`%${location}%`); conds.push(`location ilike $${params.length}`); }
    if (type) { params.push(type); conds.push(`job_type = $${params.length}`); }
    if (category) { params.push(category); conds.push(`category = $${params.length}`); }
    if (language) { params.push(language); conds.push(`language = $${params.length}`); }
    const where = conds.length ? `where ${conds.join(' and ')}` : '';
    const q = `select id, title, company, description, required_skills, location, job_type, category, language from jobs ${where} order by created_at desc`;
    const rows = await pool.query(q, params);
    res.json({ jobs: rows.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs/filters', async (_req, res) => {
  try {
    await ensureSeeded();
    const [types, categories, languages, locations] = await Promise.all([
      pool.query('select distinct job_type from jobs where job_type is not null order by job_type'),
      pool.query('select distinct category from jobs where category is not null order by category'),
      pool.query('select distinct language from jobs where language is not null order by language'),
      pool.query('select distinct location from jobs where location is not null order by location'),
    ]);
    res.json({
      types: types.rows.map(r => r.job_type),
      categories: categories.rows.map(r => r.category),
      languages: languages.rows.map(r => r.language),
      locations: locations.rows.map(r => r.location),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ensureSeeded();
    const q = await pool.query('select id, title, company, description, required_skills, location, job_type, category, language from jobs where id=$1::int', [id]);
    if (q.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ job: q.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


