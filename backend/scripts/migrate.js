const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db');

if (!pool) {
  console.error('DATABASE_URL is not set. Cannot run migrations.');
  process.exit(1);
}

const migrationsDir = path.resolve(__dirname, '..', 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT id FROM schema_migrations ORDER BY id ASC;');
  return new Set(result.rows.map((row) => row.id));
}

async function applyMigration(fileName) {
  const filePath = path.join(migrationsDir, fileName);
  const sql = fs.readFileSync(filePath, 'utf-8');
  await pool.query('BEGIN;');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (id) VALUES ($1);', [fileName]);
    await pool.query('COMMIT;');
    console.log(`Applied migration: ${fileName}`);
  } catch (error) {
    await pool.query('ROLLBACK;');
    throw error;
  }
}

async function run() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    if (!applied.has(file)) {
      await applyMigration(file);
    }
  }

  console.log('Migrations complete.');
  await pool.end();
}

run().catch((error) => {
  console.error('Migration failed:', error);
  pool.end().catch(() => {});
  process.exit(1);
});
