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
