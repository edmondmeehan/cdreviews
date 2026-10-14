DROP POLICY IF EXISTS "Anyone reads site settings" ON public.site_settings;
CREATE POLICY "Anyone reads the site status row" ON public.site_settings FOR SELECT TO anon, authenticated USING (id = 1);
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_singleton;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_singleton CHECK (id = 1);