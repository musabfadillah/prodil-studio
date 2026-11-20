import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const schemaSQL = `
-- Prodil Studio Database Schema for PostgreSQL
-- Run on Hostinger VPS Ubuntu: npm run db:migrate

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    google_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(32) DEFAULT 'email_verification',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    personal_info JSONB DEFAULT '{}',
    socials JSONB DEFAULT '[]',
    summaries JSONB DEFAULT '[]',
    experiences JSONB DEFAULT '[]',
    projects JSONB DEFAULT '[]',
    educations JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    custom_sections JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_documents (
    id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    theme_id INTEGER DEFAULT 1,
    accent_color VARCHAR(32) DEFAULT '#2563eb',
    font_family VARCHAR(64) DEFAULT 'Plus Jakarta Sans',
    custom_config JSONB DEFAULT '{}',
    section_order JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT FALSE,
    public_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters (
    id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    recipient_title VARCHAR(255),
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    letter_body TEXT,
    accent_color VARCHAR(32) DEFAULT '#2563eb',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    feature VARCHAR(64) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cv_user_id ON cv_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cover_user_id ON cover_letters(user_id);
`;

async function runMigration() {
  console.log('🚀 [PostgreSQL Migration] Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Hostinger / PostgreSQL instance.');
    console.log('⚙️ Executing SQL Schema tables...');
    await client.query(schemaSQL);
    console.log('🎉 [Success] All Prodil Studio tables & indexes created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
