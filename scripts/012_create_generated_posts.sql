-- Últimos feeds gerados na área Criar Post.
-- A API mantém apenas os 6 mais recentes por usuário.

create table if not exists public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  format text not null default 'single',
  objective text,
  post jsonb not null,
  created_at timestamptz default now()
);

alter table public.generated_posts enable row level security;

create policy "generated_posts_select_own"
  on public.generated_posts for select
  using (auth.uid() = user_id);

create policy "generated_posts_insert_own"
  on public.generated_posts for insert
  with check (auth.uid() = user_id);

create policy "generated_posts_delete_own"
  on public.generated_posts for delete
  using (auth.uid() = user_id);

create index if not exists generated_posts_user_created_idx
  on public.generated_posts (user_id, created_at desc);
