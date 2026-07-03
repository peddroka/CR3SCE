-- Colunas usadas pelo questionário inicial (onboarding) que faltavam no schema.
-- Sem elas, o salvamento do passo a passo falha com "coluna não encontrada".

alter table public.businesses add column if not exists growth_speed text;
alter table public.businesses add column if not exists responsible_name text;
alter table public.businesses add column if not exists instagram_handle text;
alter table public.businesses add column if not exists instagram_type text;
alter table public.businesses add column if not exists bio_screenshot_url text;
alter table public.businesses add column if not exists bio_screenshots text[];
