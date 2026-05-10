-- ============================================================
-- VecindApp — Schema SQL
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Communities
CREATE TABLE IF NOT EXISTS communities (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Owners (propietarios)
CREATE TABLE IF NOT EXISTS owners (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id  UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  unit          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns (avisos enviados)
CREATE TABLE IF NOT EXISTS campaigns (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  community_id      UUID REFERENCES communities(id) ON DELETE SET NULL,
  community_name    TEXT NOT NULL,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  has_pdf           BOOLEAN DEFAULT FALSE,
  sent_at           TIMESTAMPTZ DEFAULT NOW(),
  total_recipients  INTEGER DEFAULT 0
);

-- Campaign rows (estado por propietario)
CREATE TABLE IF NOT EXISTS campaign_rows (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  owner_id      UUID REFERENCES owners(id) ON DELETE SET NULL,
  owner_name    TEXT NOT NULL,
  unit          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  status        TEXT CHECK (status IN ('sent','delivered','read','confirmed','failed')) DEFAULT 'sent',
  read_at       TEXT,
  confirmed_at  TEXT,
  reply         TEXT
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE communities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_rows ENABLE ROW LEVEL SECURITY;

-- Communities: solo el propietario ve y modifica las suyas
CREATE POLICY "communities_own" ON communities
  FOR ALL USING (auth.uid() = user_id);

-- Owners: acceso si eres propietario de la comunidad
CREATE POLICY "owners_own" ON owners
  FOR ALL USING (
    community_id IN (
      SELECT id FROM communities WHERE user_id = auth.uid()
    )
  );

-- Campaigns: solo las tuyas
CREATE POLICY "campaigns_own" ON campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Campaign rows: acceso si la campaña es tuya
CREATE POLICY "campaign_rows_own" ON campaign_rows
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- Datos de ejemplo (opcional — borrar si no los quieres)
-- ============================================================
-- Nota: sustituye 'TU_USER_ID' por tu UUID de auth.users
-- Lo encuentras en: Authentication → Users → tu usuario → User UID

/*
INSERT INTO communities (user_id, name, address) VALUES
  ('TU_USER_ID', 'C/ Gran Vía 42',     'C/ Gran Vía 42, Madrid'),
  ('TU_USER_ID', 'Avda. Diagonal 88',  'Avda. Diagonal 88, Barcelona'),
  ('TU_USER_ID', 'C/ Colón 15',        'C/ Colón 15, Valencia');
*/
