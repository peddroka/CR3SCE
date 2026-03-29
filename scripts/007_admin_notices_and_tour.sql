ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS admin_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link_url TEXT,
  link_label TEXT,
  notice_type TEXT DEFAULT 'aviso',
  promo_code TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_notices
ADD COLUMN IF NOT EXISTS notice_type TEXT DEFAULT 'aviso';

ALTER TABLE admin_notices
ADD COLUMN IF NOT EXISTS promo_code TEXT;

CREATE TABLE IF NOT EXISTS notice_dismissals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notice_id UUID REFERENCES admin_notices(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notice_id)
);

ALTER TABLE admin_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active notices" ON admin_notices;
CREATE POLICY "Anyone can read active notices"
  ON admin_notices FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Users can manage own dismissals" ON notice_dismissals;
CREATE POLICY "Users can manage own dismissals"
  ON notice_dismissals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
