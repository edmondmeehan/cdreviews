CREATE TABLE public.featured_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_slug text NOT NULL,
  headline text,
  blurb text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.featured_slots TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.featured_slots TO authenticated;
GRANT ALL ON public.featured_slots TO service_role;
ALTER TABLE public.featured_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads live features" ON public.featured_slots FOR SELECT TO anon, authenticated USING (starts_at <= now() OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage features" ON public.featured_slots FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));