import pg from 'pg';

let poolInstance = null;

export function getDbPool() {
  if (poolInstance) return poolInstance;

  const {
    DATABASE_URL,
    PGHOST,
    PGPORT,
    PGDATABASE,
    PGUSER,
    PGPASSWORD,
    PGSSLMODE,
  } = process.env;

  let connectionString = DATABASE_URL;

  if (!connectionString) {
    // Coerce envs safely to expected types
    const host = (PGHOST ?? 'localhost').toString();
    const port = Number(PGPORT ?? 5432);
    const database = (PGDATABASE ?? 'jobspeedy').toString();
    const user = (PGUSER ?? 'postgres').toString();
    const password = String(PGPASSWORD ?? '');

    if (!password || password.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[pg] PGPASSWORD is empty or missing. Set it in the project root .env');
    }

    const encodedUser = encodeURIComponent(user);
    const encodedPass = encodeURIComponent(password);
    const encodedHost = host; // host usually does not need encoding
    connectionString = `postgresql://${encodedUser}:${encodedPass}@${encodedHost}:${port}/${database}`;
  }

  const sslMode = (PGSSLMODE ?? (connectionString?.includes('neon.tech') ? 'require' : '')).toLowerCase();
  const useSsl = sslMode === 'require' || sslMode === 'true';

  const config = {
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  };

  poolInstance = new pg.Pool(config);
  return poolInstance;
}


