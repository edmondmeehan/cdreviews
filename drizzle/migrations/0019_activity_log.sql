-- Change log for the editorial desk: who changed what, and when.
-- Rows are written only by triggers; staff can read them, nobody can edit them.
CREATE TABLE IF NOT EXISTS public.activity_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  entity text NOT NULL,
  record_id text,
  label text,
  changed text[]
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS activity_log_at_idx ON public.activity_log (at DESC);--> statement-breakpoint
GRANT SELECT ON public.activity_log TO authenticated;--> statement-breakpoint
GRANT ALL ON public.activity_log TO service_role;--> statement-breakpoint
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Staff read activity" ON public.activity_log FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec jsonb;
  prev jsonb;
  fields text[];
  lbl text;
  act text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rec := to_jsonb(OLD); act := 'deleted';
  ELSIF TG_OP = 'INSERT' THEN
    rec := to_jsonb(NEW); act := 'created';
  ELSE
    rec := to_jsonb(NEW); prev := to_jsonb(OLD); act := 'updated';
    SELECT array_agg(key ORDER BY key) INTO fields
    FROM jsonb_each(rec) AS n(key, value)
    WHERE key NOT IN ('updated_at')
      AND n.value IS DISTINCT FROM prev -> key;
    -- Ignore saves that changed nothing.
    IF fields IS NULL THEN RETURN NEW; END IF;
  END IF;

  IF TG_TABLE_NAME = 'user_roles' THEN
    SELECT (rec ->> 'role') || ' — ' || coalesce(u.email, rec ->> 'user_id')
      INTO lbl FROM auth.users u WHERE u.id = (rec ->> 'user_id')::uuid;
    lbl := coalesce(lbl, rec ->> 'role');
  ELSIF TG_TABLE_NAME = 'reviews' THEN
    lbl := coalesce(rec ->> 'artist', '') || ' — ' || coalesce(rec ->> 'title', '');
  ELSE
    lbl := coalesce(rec ->> 'title', rec ->> 'name', rec ->> 'headline', rec ->> 'advertiser', rec ->> 'review_slug', TG_TABLE_NAME);
  END IF;

  INSERT INTO public.activity_log (actor_id, actor_email, action, entity, record_id, label, changed)
  VALUES (auth.uid(), auth.jwt() ->> 'email', act, TG_TABLE_NAME, rec ->> 'id', lbl, fields);

  RETURN coalesce(NEW, OLD);
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.reviews;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.features;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.features FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.lists;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.contributors;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.contributors FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.ads;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.featured_slots;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.featured_slots FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.site_settings;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.radio_settings;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.radio_settings FOR EACH ROW EXECUTE FUNCTION public.log_activity();--> statement-breakpoint
DROP TRIGGER IF EXISTS log_activity ON public.user_roles;--> statement-breakpoint
CREATE TRIGGER log_activity AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_activity();
