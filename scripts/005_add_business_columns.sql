-- Add missing columns to businesses table for the onboarding questionnaire
alter table public.businesses add column if not exists niche text;
alter table public.businesses add column if not exists main_goal text;
alter table public.businesses add column if not exists platforms text;
alter table public.businesses add column if not exists communication_style text;
alter table public.businesses add column if not exists content_frequency text;
alter table public.businesses add column if not exists brand_description text;
alter table public.businesses add column if not exists competitors text;
alter table public.businesses add column if not exists unique_value text;
