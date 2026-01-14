try {
  require('dotenv').config();
} catch {
  // dotenv is optional in managed environments (e.g., Railway).
}
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl
    })
  : null;

module.exports = {
  pool
};
