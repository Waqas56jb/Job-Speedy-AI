// import dotenv from 'dotenv';
// import { dirname, resolve } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const rootEnvPath = resolve(__dirname, '../../.env');
// dotenv.config({ path: rootEnvPath });



import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootEnvPath = resolve(__dirname, '../../.env');
const result = dotenv.config({ path: rootEnvPath });

console.log('[env] load result', rootEnvPath, result.error ? result.error.message : 'ok');
console.log('[env] DATABASE_URL', process.env.DATABASE_URL);