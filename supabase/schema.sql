-- Ta référence.com — Pont de données Supabase (Pilier 1 Vitrine <-> Pilier 2 Cockpit)
-- Exécuter une seule fois dans Supabase SQL Editor.

create table if not exists public.trf_store_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.trf_store_state enable row level security;

-- Lecture/écriture réservées exclusivement aux fonctions serveur Vercel (service_role)
create policy "service_role_full_access"
  on public.trf_store_state
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into public.trf_store_state (id, payload)
values (
  'main',
  '{"products":[],"orders":[],"signatures":[],"movements":[],"snapshots":[],"sealed":false,"siteConfig":{"slogan":"L’essentiel, bien choisi."}}'::jsonb
)
on conflict (id) do nothing;
