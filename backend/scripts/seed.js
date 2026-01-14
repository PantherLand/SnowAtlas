const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db');

if (!pool) {
  console.error('DATABASE_URL is not set. Cannot seed database.');
  process.exit(1);
}

const dataPath = path.resolve(__dirname, '..', 'data', 'skiResorts.json');

function loadResorts() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

async function upsertResort(resort) {
  const query = `
    INSERT INTO resorts (
      id,
      name_en,
      name_zh,
      country,
      country_code,
      region_en,
      region_zh,
      latitude,
      longitude,
      elevation_base,
      elevation_summit,
      popularity,
      timezone,
      trail_count,
      longest_run_km,
      trail_data_source,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name_en = EXCLUDED.name_en,
      name_zh = EXCLUDED.name_zh,
      country = EXCLUDED.country,
      country_code = EXCLUDED.country_code,
      region_en = EXCLUDED.region_en,
      region_zh = EXCLUDED.region_zh,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      elevation_base = EXCLUDED.elevation_base,
      elevation_summit = EXCLUDED.elevation_summit,
      popularity = EXCLUDED.popularity,
      timezone = EXCLUDED.timezone,
      trail_count = EXCLUDED.trail_count,
      longest_run_km = EXCLUDED.longest_run_km,
      trail_data_source = EXCLUDED.trail_data_source,
      updated_at = NOW();
  `;

  const values = [
    resort.id,
    resort.name?.en || resort.name || null,
    resort.name?.zh || null,
    resort.country,
    resort.countryCode,
    resort.region?.en || resort.region || null,
    resort.region?.zh || null,
    resort.coordinates?.lat,
    resort.coordinates?.lon,
    resort.elevation?.base ?? null,
    resort.elevation?.summit ?? null,
    resort.popularity ?? null,
    resort.timezone ?? null,
    resort.trailCount ?? null,
    resort.longestRunKm ?? null,
    resort.trailDataSource ?? null
  ];

  await pool.query(query, values);
}

async function run() {
  const resorts = loadResorts();
  for (const resort of resorts) {
    await upsertResort(resort);
  }
  console.log(`Seeded resorts: ${resorts.length}`);
  await pool.end();
}

run().catch((error) => {
  console.error('Seed failed:', error);
  pool.end().catch(() => {});
  process.exit(1);
});
