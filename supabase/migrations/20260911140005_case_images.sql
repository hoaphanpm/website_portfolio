-- case_images: metadata for uploaded case-study images.
-- The actual file bytes live in the private `case-images` Storage bucket
-- (see the storage migration); this table is the authorization-relevant
-- record that Storage RLS checks against via can_read_case_image().
create table if not exists case_images (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  mime_type text,
  size_bytes integer,
  width integer,
  height integer,
  created_at timestamptz not null default now(),

  constraint case_images_storage_path_key unique (storage_path),
  -- Lets cases.hero_image_id's composite FK (added below) guarantee a hero
  -- image always belongs to the same case it's set on.
  constraint case_images_id_case_id_key unique (id, case_id)
);

comment on table case_images is
  'Managed image library, scoped per case. Public (anon) may read metadata only if the parent case is published (see RLS migration). File bytes are served only via the application''s authorized /media/[image_id] route (Milestone 7), never a public Storage URL.';
comment on column case_images.storage_path is
  'Format: {cases.id}/{case_images.id}.{ext} — uses the case''s internal uuid, so editing case_id never moves files.';

-- Deferred from the cases migration: hero_image_id must reference an image
-- that belongs to the same case (docs/architecture.md §2).
alter table cases
  add constraint cases_hero_image_fk
  foreign key (hero_image_id, id) references case_images (id, case_id)
  on delete restrict;
