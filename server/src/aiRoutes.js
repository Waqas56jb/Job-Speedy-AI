import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { getDbPool } from './pg.js';
import OpenAI from 'openai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const pool = getDbPool();

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function extractTextFromBuffer(file) {
  const mime = file.mimetype || '';
  if (mime.includes('pdf')) {
    try {
      const data = await pdfParse(file.buffer);
      return data.text || '';
    } catch (_) {}
  }
  // OCR fallback
  const { data } = await Tesseract.recognize(file.buffer, 'eng');
  return data.text || '';
}

async function parseWithAI(rawText) {
  const client = getOpenAI();
  const fallback = {
    skills: [],
    experience: [],
    education: ''
  };
  if (!client) return fallback;
  const system = 'You extract structured resume info as strict JSON with keys: skills (array of strings), experience (array of {role, company, years}), education (string). Only return JSON.';
  const prompt = `Resume text:\n${rawText}\nReturn only JSON.`;
  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });
    const content = resp.choices?.[0]?.message?.content || '';
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      return JSON.parse(content.slice(jsonStart, jsonEnd + 1));
    }
  } catch (err) {
    // swallow and use fallback
  }
  return fallback;
}

function normalizeSkills(skills) {
  const results = new Set();
  (skills || []).forEach((s) => {
    if (!s) return;
    const lower = String(s).toLowerCase();
    // split on commas, slashes and spaces, keep tech tokens together where possible
    lower.split(/[,+/]|\band\b/).map(t => t.trim()).forEach((t) => {
      if (!t) return;
      results.add(t);
    });
  });
  // simple synonyms
  const mapped = new Set(Array.from(results).map((t) => {
    if (t.includes('react native')) return 'react';
    if (t.includes('nodejs') || t.includes('node.js')) return 'node.js';
    if (t === 'js') return 'javascript';
    if (t.includes('postgres')) return 'postgresql';
    return t;
  }));
  return mapped;
}

async function classifyRole(skills) {
  const client = getOpenAI();
  const families = [
    { name: 'Frontend Developer', keys: ['react','html','css','javascript','typescript','next.js','ui'] },
    { name: 'Backend Developer', keys: ['node.js','express','postgresql','sql','api'] },
    { name: 'Full Stack Developer', keys: ['react','node.js','sql','api'] },
    { name: 'AI Engineer', keys: ['python','ml','machine learning','nlp','pytorch','tensorflow'] },
    { name: 'DevOps Engineer', keys: ['docker','aws','ci/cd','kubernetes','terraform'] },
  ];
  const norm = normalizeSkills(skills);
  // heuristic first
  const scored = families.map((f) => {
    const overlap = f.keys.filter((k) => Array.from(norm).some((s) => s.includes(k))).length;
    const score = overlap / Math.max(1, f.keys.length);
    return { name: f.name, score };
  }).sort((a,b) => b.score - a.score);
  const top = scored[0];
  // If OpenAI available, ask it for a nicer label and percent
  if (client) {
    try {
      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Classify the role of a resume given skills. Respond with JSON: {label: string, percent: number 0-100}. Nothing else.' },
          { role: 'user', content: `Skills: ${Array.from(norm).join(', ')}` },
        ],
        temperature: 0.1,
      });
      const content = resp.choices?.[0]?.message?.content || '';
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start >= 0 && end > start) {
        const j = JSON.parse(content.slice(start, end+1));
        if (j && j.label) return `${j.percent ?? Math.round((top.score||0)*100)}% ${j.label}`;
      }
    } catch (_) {}
  }
  return `${Math.round((top?.score||0)*100)}% ${top?.name || 'Unknown Role'}`;
}

router.post('/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone } = req.body || {};
    if (!req.file) return res.status(400).json({ error: 'resume file is required' });
    const text = await extractTextFromBuffer(req.file);
    const parsed = await parseWithAI(text);
    // classification text for UI
    const classification = await classifyRole(parsed.skills || []);

    const insert = await pool.query(
      'insert into applicants (name, email, phone, skills, experience, education, resume_filename, resume_mime, resume_data) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id',
      [name || null, email || null, phone || null, parsed.skills || [], JSON.stringify(parsed.experience || []), parsed.education || null, req.file.originalname || null, req.file.mimetype || null, req.file.buffer]
    );
    res.json({ applicantId: insert.rows[0].id, classification, ...parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/suggest-jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await pool.query('select skills, experience, education from applicants where id=$1', [id]);
    if (applicant.rowCount === 0) return res.status(404).json({ error: 'applicant not found' });
    const applicantSkills = applicant.rows[0].skills || [];
    const applicantExp = applicant.rows[0].experience || [];
    const normApplicant = normalizeSkills(applicantSkills);

    const expText = Array.isArray(applicantExp)
      ? applicantExp.map((e) => [e.role, e.company, e.years, e.description].filter(Boolean).join(' ')).join(' ')
      : '';

    const tokenize = (txt) => {
      return String(txt || '')
        .toLowerCase()
        .replace(/[^a-z0-9+#.\/-\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t && t.length > 1);
    };

    const applicantTokens = new Set([
      ...Array.from(normApplicant),
      ...tokenize(expText),
      ...tokenize(applicant.rows[0].education || ''),
    ]);

    const jobsRes = await pool.query('select id, title, company, description, required_skills, location from jobs');

    const scored = jobsRes.rows.map((j) => {
      const normReq = normalizeSkills(j.required_skills || []);
      const jobTokens = new Set([
        ...Array.from(normReq),
        ...tokenize(j.title),
        ...tokenize(j.description),
        ...tokenize(j.location),
      ]);

      // Skill overlap (weighted higher)
      const skillOverlap = Array.from(normReq).filter((s) => Array.from(applicantTokens).some((a) => a.includes(s) || s.includes(a))).length;
      const skillScore = skillOverlap / Math.max(1, normReq.size);

      // Description/title similarity via Jaccard
      const inter = Array.from(jobTokens).filter((t) => applicantTokens.has(t)).length;
      const union = new Set([...jobTokens, ...applicantTokens]).size;
      const descScore = inter / Math.max(1, union);

      const total = 0.65 * skillScore + 0.35 * descScore;
      return { ...j, score: total };
    });

    // Optional refinement with OpenAI to incorporate semantics better
    const client = getOpenAI();
    let ranked = scored;
    if (client) {
      try {
        const top10 = scored.sort((a,b)=>b.score-a.score).slice(0,10);
        const prompt = `Applicant skills: ${Array.from(normApplicant).join(', ')}\nApplicant experience: ${expText}\nFor each job, give a relevance percent 0-100 as JSON array in same order. Jobs: ${top10.map(j=>`${j.title} at ${j.company} (skills: ${(j.required_skills||[]).join(', ')})`).join(' | ')}`;
        const resp = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Return ONLY a JSON array of numbers length N (0-100).' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
        });
        const content = resp.choices?.[0]?.message?.content || '';
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']');
        if (start>=0 && end>start) {
          const arr = JSON.parse(content.slice(start,end+1));
          ranked = top10.map((j, i) => ({ ...j, score: isFinite(arr[i]) ? Math.min(1, Math.max(0, Number(arr[i])/100)) : j.score }));
        } else {
          ranked = scored.sort((a,b)=>b.score-a.score).slice(0,5);
        }
      } catch (_) {
        ranked = scored.sort((a,b)=>b.score-a.score).slice(0,5);
      }
    } else {
      ranked = scored.sort((a,b)=>b.score-a.score).slice(0,5);
    }

    res.json({ jobs: ranked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


