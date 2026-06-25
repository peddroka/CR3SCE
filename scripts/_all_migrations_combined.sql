-- =====================================================
-- CR3SCE — TODAS as migrations concatenadas (ordem 001 a 011)
-- Cole tudo no Supabase Dashboard > SQL Editor e execute (Run).
-- Gerado em 2026-06-24
-- =====================================================


-- ============================================================
-- >>> 001_create_profiles.sql
-- ============================================================
-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  date_of_birth date,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    new.email,
    case
      when new.raw_user_meta_data ->> 'date_of_birth' is not null
      then (new.raw_user_meta_data ->> 'date_of_birth')::date
      else null
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================
-- >>> 002_create_businesses.sql
-- ============================================================
-- Create businesses table
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  business_type text,
  location text,
  target_audience text,
  instagram_url text,
  tiktok_url text,
  posting_frequency text,
  goals text[] default '{}',
  monthly_budget text,
  growth_timeline text,
  differentials text,
  content_style text,
  plan_type text default 'monthly' check (plan_type in ('monthly', 'annual')),
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

alter table public.businesses enable row level security;

create policy "businesses_select_own" on public.businesses for select using (auth.uid() = user_id);
create policy "businesses_insert_own" on public.businesses for insert with check (auth.uid() = user_id);
create policy "businesses_update_own" on public.businesses for update using (auth.uid() = user_id);
create policy "businesses_delete_own" on public.businesses for delete using (auth.uid() = user_id);


-- ============================================================
-- >>> 003_create_strategies.sql
-- ============================================================
-- Create strategies table
create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null,
  created_at timestamptz default now()
);

alter table public.strategies enable row level security;

create policy "strategies_select_own" on public.strategies
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );

create policy "strategies_insert_own" on public.strategies
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );

create policy "strategies_update_own" on public.strategies
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );

create policy "strategies_delete_own" on public.strategies
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );

-- Create strategy_days table
create table if not exists public.strategy_days (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.strategies(id) on delete cascade,
  day_date date not null,
  title text not null,
  platform text not null,
  content_type text not null,
  description text,
  caption text,
  hashtags text[] default '{}',
  tip text,
  goal_association text,
  created_at timestamptz default now()
);

alter table public.strategy_days enable row level security;

create policy "strategy_days_select_own" on public.strategy_days
  for select using (
    exists (
      select 1 from public.strategies s
      join public.businesses b on b.id = s.business_id
      where s.id = strategy_id and b.user_id = auth.uid()
    )
  );

create policy "strategy_days_insert_own" on public.strategy_days
  for insert with check (
    exists (
      select 1 from public.strategies s
      join public.businesses b on b.id = s.business_id
      where s.id = strategy_id and b.user_id = auth.uid()
    )
  );

create policy "strategy_days_update_own" on public.strategy_days
  for update using (
    exists (
      select 1 from public.strategies s
      join public.businesses b on b.id = s.business_id
      where s.id = strategy_id and b.user_id = auth.uid()
    )
  );

create policy "strategy_days_delete_own" on public.strategy_days
  for delete using (
    exists (
      select 1 from public.strategies s
      join public.businesses b on b.id = s.business_id
      where s.id = strategy_id and b.user_id = auth.uid()
    )
  );


-- ============================================================
-- >>> 004_create_chat.sql
-- ============================================================
-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages_select_own" on public.chat_messages
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );

create policy "chat_messages_insert_own" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );

create policy "chat_messages_delete_own" on public.chat_messages
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.user_id = auth.uid()
    )
  );


-- ============================================================
-- >>> 005_add_business_columns.sql
-- ============================================================
-- Add missing columns to businesses table for the onboarding questionnaire
alter table public.businesses add column if not exists niche text;
alter table public.businesses add column if not exists main_goal text;
alter table public.businesses add column if not exists platforms text;
alter table public.businesses add column if not exists communication_style text;
alter table public.businesses add column if not exists content_frequency text;
alter table public.businesses add column if not exists brand_description text;
alter table public.businesses add column if not exists competitors text;
alter table public.businesses add column if not exists unique_value text;


-- ============================================================
-- >>> 006_add_cakto_payments.sql
-- ============================================================
-- Adicionar colunas de pagamento na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cakto_order_id TEXT;

-- Tabela para pagamentos feitos antes do cadastro
CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  cakto_order_id TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- RLS na pending_payments (apenas server-side acessa)
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Criar profiles caso a tabela ainda não exista
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_confirmed_at TIMESTAMPTZ,
  cakto_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- >>> 007_admin_notices_and_tour.sql
-- ============================================================
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


-- ============================================================
-- >>> 008_add_brand_assets.sql
-- ============================================================
alter table public.businesses
  add column if not exists brand_colors text[] default '{}';

alter table public.businesses
  add column if not exists logo_url text;


-- ============================================================
-- >>> 009_create_image_generations.sql
-- ============================================================
create table if not exists public.image_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_image_generations_user_time
on public.image_generations(user_id, created_at desc);


-- ============================================================
-- >>> 010_create_video_editor_jobs.sql
-- ============================================================
-- Referencia opcional para persistencia futura de jobs de edicao de video.
-- A implementacao atual usa armazenamento temporario em disco por 24h.
-- Este arquivo deixa o schema pronto caso o time queira migrar o controle
-- de uso diario e historico para o Supabase.

create table if not exists public.video_editor_jobs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  instruction text not null,
  summary text,
  original_filename text not null,
  output_path text not null,
  output_mime_type text not null,
  warnings jsonb not null default '[]'::jsonb,
  operations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists video_editor_jobs_user_created_idx
  on public.video_editor_jobs (user_id, created_at desc);

alter table public.video_editor_jobs enable row level security;

create policy "video_editor_jobs_select_own"
  on public.video_editor_jobs
  for select
  using (auth.uid() = user_id);

create policy "video_editor_jobs_insert_own"
  on public.video_editor_jobs
  for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- >>> 011_lgpd_consent_and_audit.sql
-- ============================================================
-- LGPD compliance: consents, audit logs and account deletion requests
-- Aplicar via Supabase Dashboard > SQL Editor

-- =========================================================
-- 1) CONSENTS — registro auditavel de cada consentimento dado/revogado
-- =========================================================
create table if not exists public.consents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in (
    'terms_of_use',
    'privacy_policy',
    'cookies_analytics',
    'cookies_marketing',
    'marketing_emails',
    'ai_processing'
  )),
  version text not null,
  granted boolean not null,
  granted_at timestamptz default now() not null,
  revoked_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);

create index if not exists idx_consents_user_type
  on public.consents(user_id, type, created_at desc);

alter table public.consents enable row level security;

drop policy if exists "Users can view own consents" on public.consents;
create policy "Users can view own consents"
  on public.consents for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own consents" on public.consents;
create policy "Users can insert own consents"
  on public.consents for insert
  with check (auth.uid() = user_id);

-- =========================================================
-- 2) AUDIT_LOGS — trilha de auditoria de acoes sensiveis
-- =========================================================
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);

create index if not exists idx_audit_logs_user_time
  on public.audit_logs(user_id, created_at desc);
create index if not exists idx_audit_logs_action_time
  on public.audit_logs(action, created_at desc);

alter table public.audit_logs enable row level security;

-- Apenas service-role escreve; usuario pode ler os proprios registros
drop policy if exists "Users can view own audit logs" on public.audit_logs;
create policy "Users can view own audit logs"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- =========================================================
-- 3) DATA_DELETION_REQUESTS — pedido de exclusao com janela de 30 dias
-- =========================================================
create table if not exists public.data_deletion_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  reason text,
  requested_at timestamptz default now() not null,
  scheduled_for timestamptz not null,
  completed_at timestamptz,
  cancelled_at timestamptz,
  status text not null default 'pending' check (status in (
    'pending',
    'cancelled',
    'completed'
  ))
);

create index if not exists idx_deletion_requests_status
  on public.data_deletion_requests(status, scheduled_for);

alter table public.data_deletion_requests enable row level security;

drop policy if exists "Users can view own deletion request" on public.data_deletion_requests;
create policy "Users can view own deletion request"
  on public.data_deletion_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own deletion request" on public.data_deletion_requests;
create policy "Users can insert own deletion request"
  on public.data_deletion_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can cancel own deletion request" on public.data_deletion_requests;
create policy "Users can cancel own deletion request"
  on public.data_deletion_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- 4) Profile fields para preferencia de marketing (opt-in)
-- =========================================================
alter table public.profiles
  add column if not exists marketing_emails_opt_in boolean default false,
  add column if not exists marketing_emails_consent_at timestamptz;

