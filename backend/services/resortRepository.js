const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db');

const dataPath = path.resolve(__dirname, '..', 'data', 'skiResorts.json');

function mapRow(row) {
  return {
    id: row.id,
    name: {
      en: row.name_en,
      zh: row.name_zh
    },
    country: row.country,
    countryCode: row.country_code,
    region: {
      en: row.region_en,
      zh: row.region_zh
    },
    coordinates: {
      lat: Number(row.latitude),
      lon: Number(row.longitude)
    },
    elevation: {
      base: row.elevation_base,
      summit: row.elevation_summit
    },
    popularity: row.popularity,
    timezone: row.timezone,
    trailCount: row.trail_count,
    longestRunKm: row.longest_run_km ? Number(row.longest_run_km) : null,
    trailDataSource: row.trail_data_source
  };
}

function loadFromJson() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

async function getAllResorts() {
  if (!pool) return loadFromJson();
  const result = await pool.query('SELECT * FROM resorts ORDER BY popularity DESC NULLS LAST, id ASC;');
  return result.rows.map(mapRow);
}

async function getResortById(id) {
  if (!pool) {
    const resorts = loadFromJson();
    return resorts.find((resort) => resort.id === id) || null;
  }
  const result = await pool.query('SELECT * FROM resorts WHERE id = $1;', [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

async function getResortsByCountry(countryCode) {
  if (!pool) {
    const resorts = loadFromJson();
    return resorts.filter((resort) => resort.countryCode === countryCode);
  }
  const result = await pool.query('SELECT * FROM resorts WHERE country_code = $1 ORDER BY popularity DESC NULLS LAST;', [countryCode]);
  return result.rows.map(mapRow);
}

module.exports = {
  getAllResorts,
  getResortById,
  getResortsByCountry
};
