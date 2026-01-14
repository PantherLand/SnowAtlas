CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resorts (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region_en TEXT,
  region_zh TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  elevation_base INTEGER,
  elevation_summit INTEGER,
  popularity INTEGER,
  timezone TEXT,
  trail_count INTEGER,
  longest_run_km NUMERIC(6, 2),
  trail_data_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resort_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS snow_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id TEXT REFERENCES resorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_at DATE NOT NULL DEFAULT CURRENT_DATE,
  snow_depth_cm NUMERIC(6, 2),
  new_snow_cm NUMERIC(6, 2),
  temperature_c NUMERIC(5, 2),
  condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
