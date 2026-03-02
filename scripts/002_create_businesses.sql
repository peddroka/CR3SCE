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
