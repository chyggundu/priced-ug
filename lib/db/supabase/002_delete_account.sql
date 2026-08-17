-- ============================================================================
-- Priced Ug — account deletion (Apple Guideline 5.1.1(v))
-- A signed-in user can permanently delete ALL their data in one call. The
-- Clerk account itself is deleted client-side via user.delete(); this RPC
-- removes everything keyed to the caller's Clerk id in Postgres.
-- Idempotent: safe to re-run.
-- ============================================================================

create or replace function public.delete_my_account()
  returns void
  language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid text := public.clerk_uid();
begin
  if uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- products belong to the caller's business (no cascade FK, so delete first)
  delete from products
    where business_id in (select id from businesses where clerk_user_id = uid);

  -- reviews the caller authored on any business
  delete from reviews where user_id = uid;

  -- the caller's business page
  delete from businesses where clerk_user_id = uid;

  -- the caller's customer / buyer profile (name, phone, address, location)
  delete from customers where clerk_user_id = uid;
end $$;

grant execute on function public.delete_my_account() to authenticated;
