-- Make the site owner an admin.
-- Grants immediately if eddie@please.co has already signed up, and grants
-- automatically the moment that address signs up (e.g. on a fresh database).

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = 'eddie@please.co'
on conflict (user_id, role) do nothing;

create or replace function public.grant_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) = 'eddie@please.co' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_owner_admin on auth.users;
create trigger on_auth_user_created_owner_admin
  after insert on auth.users
  for each row execute function public.grant_owner_admin();
