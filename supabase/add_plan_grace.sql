-- VecindApp — Grace period columns
-- Ejecutar en: Supabase Dashboard → SQL Editor

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS over_limit_since  TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER     DEFAULT 30;
