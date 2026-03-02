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
