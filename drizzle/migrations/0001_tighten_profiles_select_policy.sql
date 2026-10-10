drop policy if exists "Profiles are public readable" on public.profiles;

create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy "Staff read all profiles" on public.profiles
  for select to authenticated
  using (public.is_staff(auth.uid()));