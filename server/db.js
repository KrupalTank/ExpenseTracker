const { Pool, types } = require('pg');
require('dotenv').config();

// Force PostgreSQL DATE columns (type 1082) to return as raw strings (YYYY-MM-DD)
types.setTypeParser(1082, (val) => val);

const rawDbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '' 
  ? process.env.DATABASE_URL.trim()
  : process.env.LOCAL_DATABASE_URL;

if (!rawDbUrl) {
  console.error("❌ ERROR: Neither DATABASE_URL nor LOCAL_DATABASE_URL is set in .env file.");
  process.exit(1);
}

// Log connection info without leaking password
try {
  const parsedUrl = new URL(rawDbUrl);
  console.log(`📡 Connecting to DB Host: ${parsedUrl.hostname}`);
} catch (e) {
  console.error("❌ ERROR: Connection string URL format is invalid. Check .env file.");
}

const isNeon = rawDbUrl.includes('neon.tech');

const pool = new Pool({
  connectionString: rawDbUrl,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log(`⚡ Connected to PostgreSQL database (${isNeon ? 'Neon Cloud' : 'Local DB'})`);
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Auto-initialize tables
const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        expense_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Database tables initialized (users & expenses)');
  } catch (err) {
    console.error('❌ Error initializing database tables:', err.message);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};