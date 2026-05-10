-- Admin billing profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre_legal  TEXT,
  cif           TEXT,
  direccion     TEXT,
  codigo_postal TEXT,
  ciudad        TEXT,
  pais          TEXT DEFAULT 'España',
  logo_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile"
  ON admin_profiles FOR ALL USING (auth.uid() = user_id);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invites (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invited_by  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email       TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (invited_by, email)
);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invites"
  ON team_invites FOR ALL USING (auth.uid() = invited_by);

-- Add tier column to subscriptions (base | plus)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'base';
