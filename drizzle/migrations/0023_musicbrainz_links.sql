-- Cache of each review's MusicBrainz release group and its CritiqueBrainz community reviews.
-- Written only by the server (service role); readers get it through the site, never directly.
CREATE TABLE IF NOT EXISTS public.musicbrainz_links (
  review_id uuid PRIMARY KEY REFERENCES public.reviews(id) ON DELETE CASCADE,
  release_group_id uuid,
  matched_title text,
  checked_at timestamptz NOT NULL DEFAULT now(),
  community jsonb,
  fetched_at timestamptz
);--> statement-breakpoint
ALTER TABLE public.musicbrainz_links ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON public.musicbrainz_links FROM anon, authenticated;--> statement-breakpoint
GRANT ALL ON public.musicbrainz_links TO service_role;
