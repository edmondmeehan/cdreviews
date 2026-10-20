-- Ads are managed by the super admin only (previously any staff member).
-- Readers still see running ads, and views/clicks are still recorded for everyone.
DROP POLICY IF EXISTS "Staff manage ads" ON public.ads;--> statement-breakpoint
CREATE POLICY "Super admin manages ads" ON public.ads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));--> statement-breakpoint

DROP POLICY IF EXISTS "Staff read ad events" ON public.ad_events;--> statement-breakpoint
CREATE POLICY "Super admin reads ad events" ON public.ad_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.ad_stats()
RETURNS TABLE(ad_id uuid, views bigint, clicks bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select e.ad_id, count(*) filter (where kind='view'), count(*) filter (where kind='click')
  from public.ad_events e where public.has_role(auth.uid(), 'super_admin'::public.app_role) group by e.ad_id
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.ad_stats() TO authenticated;--> statement-breakpoint
