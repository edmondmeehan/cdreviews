CREATE TABLE public.page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_views_created_idx ON public.page_views (created_at);
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read page views" ON public.page_views FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.record_page_view(_path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if _path is null or length(_path) > 300 or left(_path,1) <> '/' then return; end if;
  if _path like '/admin%' or _path like '/auth%' or _path like '/preview%' or _path like '/api%' then return; end if;
  insert into public.page_views(path) values (_path);
end; $$;
GRANT EXECUTE ON FUNCTION public.record_page_view(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.top_pages(_from timestamptz, _to timestamptz, _limit int DEFAULT 50)
RETURNS TABLE(path text, views bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select v.path, count(*) from public.page_views v
  where public.is_staff(auth.uid())
    and (_from is null or v.created_at >= _from) and (_to is null or v.created_at < _to)
  group by v.path order by count(*) desc, v.path limit least(coalesce(_limit,50),500)
$$;
GRANT EXECUTE ON FUNCTION public.top_pages(timestamptz, timestamptz, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.most_read_reviews(_days int DEFAULT 7, _limit int DEFAULT 5)
RETURNS TABLE(slug text, views bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select r.slug, count(*) from public.page_views v
  join public.reviews r on v.path = '/reviews/' || r.slug and r.status = 'published'
  where v.created_at >= now() - make_interval(days => least(greatest(coalesce(_days,7),1),90))
  group by r.slug order by count(*) desc, r.slug limit least(greatest(coalesce(_limit,5),1),20)
$$;
GRANT EXECUTE ON FUNCTION public.most_read_reviews(int, int) TO anon, authenticated;