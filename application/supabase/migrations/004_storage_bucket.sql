-- Create a new public bucket for payment proofs
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket
-- Allow public access to view files (so admin can see them easily without signed URLs for now)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'payment-proofs' );

-- Allow anyone to upload (since our order form is public/guest)
-- Ideally constraint this to users with a valid active session or similar, but for guest checkout:
create policy "Guest Upload"
  on storage.objects for insert
  with check ( bucket_id = 'payment-proofs' );

-- Allow users to update their own files (optional, simpler to just allow insert)
