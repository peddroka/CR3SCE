-- Tabelas do Mapa de Evolução (Jornada), que faltavam no schema.
-- Sem elas, a pesquisa inicial e os níveis gerados não são salvos.

-- Dados da pesquisa inicial + investimento mensal (1 registro por usuário/mês)
create table if not exists public.evolution_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  current_followers integer default 0,
  current_stories_views integer default 0,
  monthly_investment numeric default 0,
  month integer not null,
  year integer not null,
  created_at timestamptz default now(),
  primary key (user_id, month, year)
);

alter table public.evolution_data enable row level security;

create policy "evolution_data_select_own"
  on public.evolution_data for select using (auth.uid() = user_id);
create policy "evolution_data_insert_own"
  on public.evolution_data for insert with check (auth.uid() = user_id);
create policy "evolution_data_update_own"
  on public.evolution_data for update using (auth.uid() = user_id);
create policy "evolution_data_delete_own"
  on public.evolution_data for delete using (auth.uid() = user_id);

-- Níveis da jornada gerados pela IA (1 conjunto por usuário/mês)
create table if not exists public.evolution_levels (
  user_id uuid not null references auth.users(id) on delete cascade,
  level_number integer not null,
  title text,
  description text,
  missions jsonb,
  reward text,
  required_investment numeric default 0,
  month integer not null,
  year integer not null,
  created_at timestamptz default now(),
  primary key (user_id, level_number, month, year)
);

alter table public.evolution_levels enable row level security;

create policy "evolution_levels_select_own"
  on public.evolution_levels for select using (auth.uid() = user_id);
create policy "evolution_levels_insert_own"
  on public.evolution_levels for insert with check (auth.uid() = user_id);
create policy "evolution_levels_update_own"
  on public.evolution_levels for update using (auth.uid() = user_id);
create policy "evolution_levels_delete_own"
  on public.evolution_levels for delete using (auth.uid() = user_id);
