-- ============================================================================
-- Priced Ug — Supabase direct-access security layer
-- Replaces the Express API server: RLS + views + RPCs enforce everything the
-- server used to. Auth = Clerk JWT (third-party auth); user id = jwt 'sub'
-- (matches clerk_user_id / reviews.user_id). Admin = jwt 'email' claim.
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------- helper functions -------------------------------------------------
create or replace function public.clerk_uid() returns text
  language sql stable set search_path = public, pg_temp as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

create or replace function public.clerk_email() returns text
  language sql stable set search_path = public, pg_temp as $$
  select lower(nullif(auth.jwt() ->> 'email', ''))
$$;

-- Admin is keyed on the Clerk email claim, never a Clerk user id: ids are
-- per-instance, so switching instances silently turns every admin check off.
-- Keep this list in sync with ADMIN_EMAIL in
-- artifacts/pricedug/context/AuthContext.tsx.
-- The email path requires the Clerk "supabase" JWT template to emit an `email`
-- claim. The uid array below is a transitional fallback so admin still works
-- before that claim is added — drop it once the email path is verified.
create or replace function public.is_admin() returns boolean
  language sql stable set search_path = public, pg_temp as $$
  select coalesce(
    public.clerk_email() = any (array['priceduganda@gmail.com'])
    or public.clerk_uid() = any (array['user_3GlJiyIyEFE4HpmJr2j69dsReBd']),
    false
  )
$$;

create or replace function public.clerk_display_name() returns text
  language sql stable set search_path = public, pg_temp as $$
  select coalesce(
    nullif(btrim(concat_ws(' ', auth.jwt() ->> 'first_name', auth.jwt() ->> 'last_name')), ''),
    nullif(auth.jwt() ->> 'username', ''),
    'Anonymous'
  )
$$;

-- ---------- constraints / triggers (data integrity the server enforced) ------
alter table reviews  drop constraint if exists reviews_rating_chk;
alter table reviews  add  constraint reviews_rating_chk check (rating between 1 and 5);

alter table products drop constraint if exists products_category_fk;
alter table products add  constraint products_category_fk
  foreign key (category_id) references categories(id) on delete set null;

-- category name Title-cased (server did this)
create or replace function public.normalize_category_name() returns trigger
  language plpgsql set search_path = public, pg_temp as $$
begin
  new.name := initcap(btrim(regexp_replace(new.name, '\s+', ' ', 'g')));
  return new;
end $$;
drop trigger if exists categories_normalize on categories;
create trigger categories_normalize before insert or update on categories
  for each row execute function public.normalize_category_name();

-- owner id is always taken from the JWT, never trusted from the client
create or replace function public.set_owner_from_jwt() returns trigger
  language plpgsql set search_path = public, pg_temp as $$
begin
  new.clerk_user_id := public.clerk_uid();
  return new;
end $$;
drop trigger if exists businesses_set_owner on businesses;
create trigger businesses_set_owner before insert on businesses
  for each row execute function public.set_owner_from_jwt();
drop trigger if exists customers_set_owner on customers;
create trigger customers_set_owner before insert on customers
  for each row execute function public.set_owner_from_jwt();

-- ---------- enable RLS on every table ----------------------------------------
alter table categories          enable row level security;
alter table businesses          enable row level security;
alter table products            enable row level security;
alter table reviews             enable row level security;
alter table customers           enable row level security;
alter table objects             enable row level security;   -- no policies => locked
alter table business_categories enable row level security;   -- unused, locked

-- ---------- grants (PostgREST roles) -----------------------------------------
grant usage on schema public to anon, authenticated;

grant select                         on categories to anon, authenticated;
grant insert, delete                 on categories to authenticated;
grant select                         on businesses to anon, authenticated;
grant insert, update                 on businesses to authenticated;
grant select                         on products   to anon, authenticated;
grant insert, update, delete         on products   to authenticated;
grant delete                         on reviews     to authenticated;  -- admin only via policy
grant select, insert, update         on customers   to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ============================================================================
-- POLICIES
-- ============================================================================

-- ---- categories: public read; admin write ----
drop policy if exists categories_read   on categories;
drop policy if exists categories_insert on categories;
drop policy if exists categories_delete on categories;
create policy categories_read   on categories for select using (true);
create policy categories_insert on categories for insert to authenticated with check (public.is_admin());
create policy categories_delete on categories for delete to authenticated using (public.is_admin());

-- ---- businesses: visible if not hidden OR own OR admin; owner CRU; admin moderates ----
drop policy if exists businesses_read         on businesses;
drop policy if exists businesses_insert       on businesses;
drop policy if exists businesses_update_owner on businesses;
drop policy if exists businesses_update_admin on businesses;
create policy businesses_read on businesses for select
  using (is_hidden = false or clerk_user_id = public.clerk_uid() or public.is_admin());
create policy businesses_insert on businesses for insert to authenticated
  with check (clerk_user_id = public.clerk_uid());
-- owner may edit only while not hidden, and cannot flip is_hidden
create policy businesses_update_owner on businesses for update to authenticated
  using (clerk_user_id = public.clerk_uid() and is_hidden = false)
  with check (clerk_user_id = public.clerk_uid() and is_hidden = false);
-- admin may update anything (used for visibility toggle)
create policy businesses_update_admin on businesses for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- products: readable when parent business is visible; owner writes when not hidden; admin deletes ----
drop policy if exists products_read         on products;
drop policy if exists products_insert       on products;
drop policy if exists products_update       on products;
drop policy if exists products_delete_owner on products;
drop policy if exists products_delete_admin on products;
create policy products_read on products for select using (
  exists (select 1 from businesses b where b.id = products.business_id
          and (b.is_hidden = false or b.clerk_user_id = public.clerk_uid() or public.is_admin())));
create policy products_insert on products for insert to authenticated with check (
  exists (select 1 from businesses b where b.id = business_id
          and b.clerk_user_id = public.clerk_uid() and b.is_hidden = false));
create policy products_update on products for update to authenticated
  using (exists (select 1 from businesses b where b.id = products.business_id
                 and b.clerk_user_id = public.clerk_uid() and b.is_hidden = false))
  with check (exists (select 1 from businesses b where b.id = business_id
                 and b.clerk_user_id = public.clerk_uid() and b.is_hidden = false));
create policy products_delete_owner on products for delete to authenticated using (
  exists (select 1 from businesses b where b.id = products.business_id
          and b.clerk_user_id = public.clerk_uid() and b.is_hidden = false));
create policy products_delete_admin on products for delete to authenticated using (public.is_admin());

-- ---- reviews: no direct read (use reviews_view); writes via RPC; admin delete ----
drop policy if exists reviews_delete_admin on reviews;
create policy reviews_delete_admin on reviews for delete to authenticated using (public.is_admin());

-- ---- customers: owner or admin may read; owner upserts own ----
drop policy if exists customers_read   on customers;
drop policy if exists customers_insert on customers;
drop policy if exists customers_update on customers;
create policy customers_read on customers for select to authenticated
  using (clerk_user_id = public.clerk_uid() or public.is_admin());
create policy customers_insert on customers for insert to authenticated
  with check (clerk_user_id = public.clerk_uid());
create policy customers_update on customers for update to authenticated
  using (clerk_user_id = public.clerk_uid()) with check (clerk_user_id = public.clerk_uid());

-- ============================================================================
-- VIEWS (computed / joined reads the server used to build in JS)
-- ============================================================================

-- businesses + minPrice (parse text price) + categories (from its products)
drop view if exists public.businesses_view;
create view public.businesses_view with (security_invoker = on) as
select b.*,
  (select min(v) from (
     select nullif(regexp_replace(p.price, '[^0-9]', '', 'g'), '')::bigint as v
     from products p where p.business_id = b.id
   ) s where v > 0) as min_price,
  coalesce((
     select json_agg(json_build_object('id', c.id, 'name', c.name))
     from (select distinct c2.id, c2.name
           from products p join categories c2 on c2.id = p.category_id
           where p.business_id = b.id) c
  ), '[]'::json) as categories
from businesses b;

-- products + category name (per-business / my-products list)
drop view if exists public.products_view;
create view public.products_view with (security_invoker = on) as
select p.*, c.name as category_name
from products p left join categories c on c.id = p.category_id;

-- product search feed: product + business fields, only non-hidden businesses
drop view if exists public.products_search_view;
create view public.products_search_view with (security_invoker = on) as
select p.*, c.name as category_name,
       b.name as business_name, b.image_url as business_image_url, b.city as business_city
from products p
join businesses b on b.id = p.business_id and b.is_hidden = false
left join categories c on c.id = p.category_id;

-- reviews without user_id, with is_mine (definer: all reviews are public)
drop view if exists public.reviews_view;
create view public.reviews_view with (security_invoker = off) as
select id, business_id, author_name, rating, comment, reply, replied_at, created_at,
       (user_id = public.clerk_uid()) as is_mine
from reviews;

-- customers without clerk_user_id (self/admin read via base-table RLS)
drop view if exists public.customers_view;
create view public.customers_view with (security_invoker = on) as
select id, full_name, phone, district, town, village, street,
       address_photo_url, latitude, longitude, created_at, updated_at
from customers;

grant select on public.businesses_view, public.products_view,
                public.products_search_view, public.reviews_view to anon, authenticated;
grant select on public.customers_view to authenticated;

-- ============================================================================
-- RPCs (writes with server-owned logic / cross-row checks)
-- ============================================================================

-- create a review: author_name + user_id from JWT; not own business; one per user
create or replace function public.create_review(business_id int, rating int, comment text)
  returns public.reviews_view
  language plpgsql security definer set search_path = public, pg_temp as $$
declare uid text := public.clerk_uid(); owner text; rid int; result public.reviews_view;
begin
  if uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if rating is null or rating < 1 or rating > 5 then
    raise exception 'rating must be between 1 and 5' using errcode = '22023'; end if;
  select clerk_user_id into owner from businesses where id = business_id;
  if owner is null then raise exception 'business not found' using errcode = 'P0002'; end if;
  if owner = uid then
    raise exception 'you cannot review your own business' using errcode = '42501'; end if;
  begin
    insert into reviews (business_id, user_id, author_name, rating, comment)
    values (business_id, uid, public.clerk_display_name(), rating, nullif(btrim(comment), ''))
    returning id into rid;
  exception when unique_violation then
    raise exception 'you have already reviewed this business' using errcode = '23505';
  end;
  select * into result from public.reviews_view where id = rid;
  return result;
end $$;

-- business owner replies once to a review (atomic)
create or replace function public.reply_to_review(review_id int, reply text)
  returns public.reviews_view
  language plpgsql security definer set search_path = public, pg_temp as $$
declare uid text := public.clerk_uid(); bid int; owner text; n int; result public.reviews_view;
begin
  if uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if coalesce(btrim(reply), '') = '' then
    raise exception 'reply is required' using errcode = '22023'; end if;
  select business_id into bid from reviews where id = review_id;
  if bid is null then raise exception 'review not found' using errcode = 'P0002'; end if;
  select clerk_user_id into owner from businesses where id = bid;
  if owner is distinct from uid then
    raise exception 'only the business owner can reply' using errcode = '42501'; end if;
  update reviews set reply = btrim(reply_to_review.reply), replied_at = now()
    where id = review_id and reply is null;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'this review already has a reply' using errcode = '23505'; end if;
  select * into result from public.reviews_view where id = review_id;
  return result;
end $$;

-- privileged customer lookup (business owners or admin), exact phone + district
create or replace function public.lookup_customer(phone text, district text)
  returns public.customers_view
  language plpgsql security definer set search_path = public, pg_temp as $$
declare uid text := public.clerk_uid(); result public.customers_view;
begin
  if uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not (public.is_admin() or exists (select 1 from businesses where clerk_user_id = uid)) then
    raise exception 'only business owners can look up customers' using errcode = '42501';
  end if;
  select v.* into result from public.customers_view v
    join customers c on c.id = v.id
    where c.phone = lookup_customer.phone and c.district = lookup_customer.district
    limit 1;
  return result;  -- null row => not found (client treats as 404)
end $$;

grant execute on function public.create_review(int, int, text)   to authenticated;
grant execute on function public.reply_to_review(int, text)      to authenticated;
grant execute on function public.lookup_customer(text, text)     to authenticated;
