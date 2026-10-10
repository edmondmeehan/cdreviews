ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS preview_token uuid UNIQUE;

CREATE OR REPLACE FUNCTION public.get_review_preview(_token uuid)
RETURNS SETOF public.reviews
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ select * from public.reviews where preview_token = _token and _token is not null limit 1 $$;
REVOKE ALL ON FUNCTION public.get_review_preview(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_review_preview(uuid) TO anon, authenticated;