-- ============================================================
-- VecindApp — WhatsApp tables
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tracks which Evolution API instance belongs to each user
CREATE TABLE IF NOT EXISTS whatsapp_instances (
  instance_name  TEXT PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "whatsapp_instances_own" ON whatsapp_instances
  FOR ALL USING (auth.uid() = user_id);

-- Tracks 24-hour manual mode per contact (phone) per user
CREATE TABLE IF NOT EXISTS whatsapp_manual_mode (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone       TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, phone)
);

ALTER TABLE whatsapp_manual_mode ENABLE ROW LEVEL SECURITY;
CREATE POLICY "whatsapp_manual_mode_own" ON whatsapp_manual_mode
  FOR ALL USING (auth.uid() = user_id);

-- Add created_at to campaign_rows if it doesn't exist (needed for ordering)
ALTER TABLE campaign_rows ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
