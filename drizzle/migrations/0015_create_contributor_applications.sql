CREATE TABLE public.contributor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  samples TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contributor_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributor_applications TO authenticated;
GRANT ALL ON public.contributor_applications TO service_role;
ALTER TABLE public.contributor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.contributor_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Staff can read applications" ON public.contributor_applications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete applications" ON public.contributor_applications FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));