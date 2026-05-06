
alter function public.touch_updated_at() set search_path = public;

-- Tighten subscriber insert: require a non-empty, email-looking value
drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe with valid email" on public.subscribers
  for insert
  with check (email is not null and length(email) between 5 and 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- has_role / is_staff are intentionally callable so RLS policies can use them.
-- handle_new_user runs only via the auth trigger, lock it down.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
