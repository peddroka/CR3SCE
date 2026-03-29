create table if not exists public.image_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_image_generations_user_time
on public.image_generations(user_id, created_at desc);
