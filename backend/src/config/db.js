import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Local fallback store path if PostgreSQL is not yet configured or connecting fails
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'local_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const localStore = {
  users: [],
  verification_tokens: [],
  master_profiles: {},
  cv_documents: {},
  cover_letters: {},
  load() {
    try {
      if (fs.existsSync(LOCAL_STORE_FILE)) {
        const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        Object.assign(this, parsed);
      }
    } catch (err) {
      console.warn('[DB] Could not load local backup store:', err.message);
    }
  },
  save() {
    try {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify({
        users: this.users,
        verification_tokens: this.verification_tokens,
        master_profiles: this.master_profiles,
        cv_documents: this.cv_documents,
        cover_letters: this.cover_letters
      }, null, 2));
    } catch (err) {
      console.error('[DB] Failed to persist local store:', err.message);
    }
  }
};

localStore.load();

let pool = null;
let isPostgresReady = false;

if (process.env.DATABASE_URL || process.env.PGHOST) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      database: process.env.PGDATABASE,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    pool.connect((err, client, release) => {
      if (err) {
        console.warn('⚠️ [PostgreSQL] Database connection failed. Seamlessly running in fallback mode.');
        console.warn(`   Error: ${err.message}`);
        console.info('👉 When deploying on Hostinger VPS, run: npm run db:migrate to initialize PostgreSQL.');
        isPostgresReady = false;
      } else {
        isPostgresReady = true;
        console.log('✅ [PostgreSQL] Successfully connected to database!');
        release();
      }
    });
  } catch (e) {
    console.warn('[PostgreSQL Pool Init Error]:', e.message);
  }
} else {
  console.info('ℹ️ [DB] No DATABASE_URL provided. Operating in high-speed local store mode.');
}

export const query = async (text, params) => {
  if (isPostgresReady && pool) {
    return pool.query(text, params);
  }
  return null;
};

export const getDbStatus = () => ({
  postgresConnected: isPostgresReady,
  mode: isPostgresReady ? 'PostgreSQL (Hostinger VPS / Cloud)' : 'Local File Persistence (Dev Mode)',
  databaseName: process.env.PGDATABASE || 'local_store'
});

export default { query, localStore, getDbStatus };
