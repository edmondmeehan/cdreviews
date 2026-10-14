DROP POLICY IF EXISTS "Admins update site settings" ON public.site_settings;
CREATE POLICY "Super admins update site settings" ON public.site_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users WHERE email = 'eddie@please.co'
AND NOT EXISTS (SELECT 1 FROM public.user_roles r JOIN auth.users u ON u.id=r.user_id WHERE u.email='eddie@please.co' AND r.role='super_admin');