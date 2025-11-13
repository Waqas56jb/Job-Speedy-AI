import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { getDbPool } from './pg.js';

let initialized = false;

export async function ensureDatabaseSchema() {
  if (initialized) return;
  if ((process.env.RUN_DB_MIGRATIONS || 'true').toLowerCase() === 'false') {
    initialized = true;
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const schemaPath = resolve(__dirname, '../sql/schema.sql');

  try {
    const sql = await readFile(schemaPath, 'utf8');
    const pool = getDbPool();
    await pool.query(sql);
    initialized = true;
    // eslint-disable-next-line no-console
    console.log('[db] Schema ensured via schema.sql');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] Failed to ensure schema', err);
    throw err;
  }
}


