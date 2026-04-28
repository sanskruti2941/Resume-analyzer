-- ─────────────────────────────────────────────────────────────────────────────
-- Intelligent Resume & Career Advisor — Supabase Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- ─────────────────────────────────────────────────────────────────────────────

-- Users table (optional, for future auth integration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table — stores uploaded resume text
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results table — stores analysis and match results
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  skills TEXT,              -- JSON array of detected skills
  score INTEGER,            -- 0-100
  score_breakdown TEXT,     -- JSON object
  careers TEXT,             -- JSON array of career recommendations
  learning_path TEXT,       -- JSON object
  match_percent INTEGER,    -- job match percentage
  matching_skills TEXT,     -- JSON array
  missing_skills TEXT,      -- JSON array
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (for demo/college project)
CREATE POLICY "Allow all for anon" ON resumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON results FOR ALL USING (true) WITH CHECK (true);
