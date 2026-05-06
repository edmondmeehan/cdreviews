
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS art_url text,
  ADD COLUMN IF NOT EXISTS spotify_url text,
  ADD COLUMN IF NOT EXISTS spotify_album_id text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-art', 'review-art', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public reads review-art" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-art');

CREATE POLICY "Staff uploads review-art" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'review-art' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff updates review-art" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'review-art' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff deletes review-art" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'review-art' AND public.is_staff(auth.uid()));
