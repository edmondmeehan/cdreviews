alter table public.reviews add column if not exists publish_at timestamptz;

create or replace function public.guard_review_schedule()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null
     and new.publish_at is distinct from (case when tg_op = 'UPDATE' then old.publish_at else null end)
     and not public.can_publish(auth.uid()) then
    raise exception 'Only senior writers, editors and admins can schedule reviews';
  end if;
  if new.status = 'published' then new.publish_at = null; end if;
  return new;
end; $$;

create trigger reviews_guard_schedule before insert or update on public.reviews
for each row execute function public.guard_review_schedule();

create extension if not exists pg_cron;

select cron.schedule('publish-scheduled-reviews', '0 * * * *', $$
  update public.reviews set status = 'published', submitted_at = null
  where status = 'draft' and publish_at is not null and publish_at <= now();
$$);