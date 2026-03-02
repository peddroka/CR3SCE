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
