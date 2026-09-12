-- Private Storage bucket + authorization for case-study images.
-- docs/architecture.md §3, decision D2.
--
-- The bucket is private: there is no public object URL for any image,
-- draft or published. Every read is authorized by RLS on storage.objects
-- below, and in the application layer is fronted by an authorized
-- /media/[image_id] route (Milestone 7) rather than a direct Storage URL.
--
-- Approved limits: 4 MB max file size; JPG/JPEG/PNG/WebP only. Note that
-- .jpg and .jpeg are the same MIME type (image/jpeg) — there is no separate
-- MIME type per file extension.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-images',
  'case-images',
  false,
  4 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Read: admin can read any object in this bucket; anyone else only if
-- can_read_case_image() says the object belongs to a published case.
create policy case_images_storage_select on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'case-images'
    and (is_admin() or can_read_case_image(name))
  );

-- Write: admin only. Upload path's first folder segment must be an existing
-- case id, matching the storage_path format {cases.id}/{case_images.id}.{ext}
-- documented on case_images.storage_path.
create policy case_images_storage_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'case-images'
    and is_admin()
    and exists (
      select 1 from cases c where c.id::text = (storage.foldername(name))[1]
    )
  );

create policy case_images_storage_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'case-images' and is_admin())
  with check (bucket_id = 'case-images' and is_admin());

create policy case_images_storage_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'case-images' and is_admin());
