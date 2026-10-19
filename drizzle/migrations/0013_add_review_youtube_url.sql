ALTER TABLE public.reviews ADD COLUMN youtube_url text;
COMMENT ON COLUMN public.reviews.youtube_url IS 'Optional YouTube video URL selected in the review editor.';