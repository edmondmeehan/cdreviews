-- Public visitors (anon) can no longer read the legacy publicist contact
-- columns on reviews (label_address, contact). Signed-in staff are unaffected.
-- Postgres column privileges only apply once the table-wide grant is removed,
-- so anon gets SELECT on an explicit column list. Add new public review
-- columns here too when they're created.
REVOKE SELECT ON public.reviews FROM anon;--> statement-breakpoint
GRANT SELECT (
  id, slug, title, artist, label, format, genre, date, decade, kind,
  score, art, byline, read_mins, body, status, archive_url, period,
  created_at, updated_at, created_by, art_url, spotify_url, spotify_album_id,
  spotify_artist_id, youtube_url, submitted_at, preview_token, publish_at
) ON public.reviews TO anon;
