CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  advertiser text NOT NULL DEFAULT '',
  placement text NOT NULL CHECK (placement IN ('home_break','review_inline','review_side','list_card','footer_strip')),
  headline text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT 'Learn more',
  image_url text,
  link_url text NOT NULL CHECK (link_url ~* '^https?://'),
  active boolean NOT NULL DEFAULT true,
  weight integer NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 100),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads running ads" ON public.ads FOR SELECT TO anon, authenticated
  USING (active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "Staff manage ads" ON public.ads FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER ads_touch BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ad_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('view','click')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ad_events_ad_kind ON public.ad_events(ad_id, kind);
GRANT SELECT ON public.ad_events TO authenticated;
GRANT ALL ON public.ad_events TO service_role;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read ad events" ON public.ad_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.record_ad_event(_ad_id uuid, _kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if _kind not in ('view','click') then return; end if;
  if not exists (select 1 from public.ads where id = _ad_id and active) then return; end if;
  insert into public.ad_events(ad_id, kind) values (_ad_id, _kind);
end; $$;
GRANT EXECUTE ON FUNCTION public.record_ad_event(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.ad_stats()
RETURNS TABLE(ad_id uuid, views bigint, clicks bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select e.ad_id, count(*) filter (where kind='view'), count(*) filter (where kind='click')
  from public.ad_events e where public.is_staff(auth.uid()) group by e.ad_id
$$;
GRANT EXECUTE ON FUNCTION public.ad_stats() TO authenticated;