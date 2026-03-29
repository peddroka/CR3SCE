alter table public.businesses
  add column if not exists brand_colors text[] default '{}';

alter table public.businesses
  add column if not exists logo_url text;
