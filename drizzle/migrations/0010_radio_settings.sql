CREATE TABLE public.radio_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title text NOT NULL DEFAULT 'Fuck It, It''s Fall.',
  description text NOT NULL DEFAULT 'The standing CDR Radio playlist — the same records we argue about in the reviews, sequenced back to back. It updates as the editors rotate the stacks.',
  playlist_url text NOT NULL DEFAULT 'https://open.spotify.com/playlist/0Lxt9bg9qMX4He0UDkxRL8',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.radio_settings TO anon, authenticated;
GRANT UPDATE ON public.radio_settings TO authenticated;
GRANT ALL ON public.radio_settings TO service_role;
ALTER TABLE public.radio_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads radio settings" ON public.radio_settings FOR SELECT TO anon, authenticated USING (id = 1);
CREATE POLICY "Staff update radio settings" ON public.radio_settings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()) AND id = 1);
INSERT INTO public.radio_settings (id) VALUES (1);