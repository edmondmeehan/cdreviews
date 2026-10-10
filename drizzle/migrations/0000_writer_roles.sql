ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'senior_writer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'writer';

CREATE OR REPLACE FUNCTION public.can_publish(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('admin','editor','senior_writer'))
$$;

CREATE OR REPLACE FUNCTION public.is_writer(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('admin','editor','senior_writer','writer'))
$$;

CREATE POLICY "Writers read all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.is_writer(auth.uid()));
CREATE POLICY "Senior writers write reviews" ON public.reviews FOR ALL TO authenticated USING (public.can_publish(auth.uid())) WITH CHECK (public.can_publish(auth.uid()));
CREATE POLICY "Writers insert draft reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.is_writer(auth.uid()) AND status <> 'published');
CREATE POLICY "Writers update draft reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_writer(auth.uid()) AND status <> 'published') WITH CHECK (public.is_writer(auth.uid()) AND status <> 'published');

CREATE POLICY "Writers read all features" ON public.features FOR SELECT TO authenticated USING (public.is_writer(auth.uid()));
CREATE POLICY "Senior writers write features" ON public.features FOR ALL TO authenticated USING (public.can_publish(auth.uid())) WITH CHECK (public.can_publish(auth.uid()));
CREATE POLICY "Writers insert draft features" ON public.features FOR INSERT TO authenticated WITH CHECK (public.is_writer(auth.uid()) AND status <> 'published');
CREATE POLICY "Writers update draft features" ON public.features FOR UPDATE TO authenticated USING (public.is_writer(auth.uid()) AND status <> 'published') WITH CHECK (public.is_writer(auth.uid()) AND status <> 'published');