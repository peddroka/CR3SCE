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
