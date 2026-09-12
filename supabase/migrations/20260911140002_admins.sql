-- admins: allowlist of Supabase Auth users permitted to manage case studies.
--
-- MVP scope is a single admin (docs/architecture.md §2). No email or UUID is
-- hardcoded anywhere in this repo. Seeding the real row is a manual,
-- documented step performed once you have a real Supabase project and have
-- signed up as a user via Supabase Auth — see supabase/README.md step 5.
--
-- This table has RLS enabled with zero policies (see the RLS migration),
-- so no anon/authenticated request can ever read or write it directly.
-- Only the SECURITY DEFINER helper functions (is_admin(), can_read_case_image())
-- can see inside it.
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table admins is
  'Allowlist of auth.users ids permitted to manage case studies. MVP: single admin, seeded manually per supabase/README.md.';
