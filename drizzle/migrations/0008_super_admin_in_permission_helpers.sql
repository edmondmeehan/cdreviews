-- The super admin was added to the role enum but the permission helpers still
-- only recognised the older roles, which locked the account holding it out of
-- the editorial desk. Treat super_admin as the top of the hierarchy.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('super_admin','admin','editor'))
$function$;

CREATE OR REPLACE FUNCTION public.is_writer(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('super_admin','admin','editor','senior_writer','writer'))
$function$;

CREATE OR REPLACE FUNCTION public.can_publish(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('super_admin','admin','editor','senior_writer'))
$function$;
