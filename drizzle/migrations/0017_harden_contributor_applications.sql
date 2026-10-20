DELETE FROM public.contributor_applications WHERE id = 'f8494483-b89b-425a-8bb3-5cdfc11220a7';

ALTER TABLE public.contributor_applications
  ADD CONSTRAINT contributor_applications_name_len CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  ADD CONSTRAINT contributor_applications_email_len CHECK (char_length(email) <= 255),
  ADD CONSTRAINT contributor_applications_email_shape CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT contributor_applications_samples_len CHECK (char_length(btrim(samples)) BETWEEN 1 AND 2000),
  ADD CONSTRAINT contributor_applications_samples_link CHECK (samples ~* '([a-z0-9-]+\.)+[a-z]{2,}'),
  ADD CONSTRAINT contributor_applications_note_len CHECK (note IS NULL OR char_length(note) <= 1000);

CREATE INDEX IF NOT EXISTS contributor_applications_email_created_idx
  ON public.contributor_applications (lower(email), created_at DESC);

CREATE OR REPLACE FUNCTION public.contributor_applications_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));
  NEW.name := btrim(NEW.name);
  IF EXISTS (
    SELECT 1 FROM public.contributor_applications
    WHERE lower(email) = NEW.email
      AND created_at > now() - interval '24 hours'
  ) THEN
    RAISE EXCEPTION 'duplicate_application' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.contributor_applications_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS contributor_applications_guard ON public.contributor_applications;
CREATE TRIGGER contributor_applications_guard
  BEFORE INSERT ON public.contributor_applications
  FOR EACH ROW EXECUTE FUNCTION public.contributor_applications_guard();