-- Volunteer referral links, badge levels and GHS 100 rewards per 4 referrals.
alter table public.volunteer_applications
  add column referral_code text unique check (referral_code ~ '^[A-Z0-9]{6,12}$'),
  add column referred_by_code text check (char_length(referred_by_code) <= 12),
  add column referral_count integer not null default 0,
  add column badge_level integer not null default 0;

alter table public.members
  add column referred_by_code text check (char_length(referred_by_code) <= 12);

create table public.volunteer_referrals (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteer_applications(id),
  referred_type text not null check (referred_type in ('volunteer','member')),
  referred_id uuid not null,
  referred_name text not null,
  referred_email text not null,
  created_at timestamptz not null default now(),
  unique (volunteer_id, referred_email)
);
grant select on public.volunteer_referrals to authenticated;
grant all on public.volunteer_referrals to service_role;
alter table public.volunteer_referrals enable row level security;
create policy "Referral staff read" on public.volunteer_referrals for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator','finance_officer']::public.app_role[]));

create table public.volunteer_rewards (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteer_applications(id),
  level integer not null check (level >= 1),
  amount numeric not null default 100,
  currency text not null default 'GHS',
  status text not null default 'pending' check (status in ('pending','approved','paid','declined')),
  paid_on date,
  payment_method text,
  reference text,
  notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (volunteer_id, level)
);
grant select, update on public.volunteer_rewards to authenticated;
grant all on public.volunteer_rewards to service_role;
alter table public.volunteer_rewards enable row level security;
create policy "Reward staff read" on public.volunteer_rewards for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator','finance_officer']::public.app_role[]));
create policy "Reward finance update" on public.volunteer_rewards for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create trigger trg_rewards_updated before update on public.volunteer_rewards for each row execute function public.set_updated_at();
create trigger trg_audit_rewards after update on public.volunteer_rewards for each row execute function public.log_audit();

-- Public cannot set their own counts.
create or replace function public.volunteer_reset_referral_stats()
returns trigger language plpgsql as $$
begin
  new.referral_count := 0;
  new.badge_level := 0;
  new.referred_by_code := nullif(upper(trim(new.referred_by_code)), '');
  return new;
end $$;
create trigger trg_volunteer_reset_stats before insert on public.volunteer_applications
  for each row execute function public.volunteer_reset_referral_stats();

create or replace function public.members_clean_ref()
returns trigger language plpgsql as $$
begin
  new.referred_by_code := nullif(upper(trim(new.referred_by_code)), '');
  return new;
end $$;
create trigger trg_members_clean_ref before insert on public.members
  for each row execute function public.members_clean_ref();

-- Record a referral; every 4th referral raises the badge level and creates a GHS 100 reward.
create or replace function public.record_referral()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v public.volunteer_applications%rowtype;
  inserted integer;
  new_count integer;
  new_level integer;
begin
  if new.referred_by_code is null then return new; end if;
  select * into v from public.volunteer_applications
    where referral_code = new.referred_by_code and status <> 'archived';
  if not found or lower(v.email) = lower(new.email) then return new; end if;

  insert into public.volunteer_referrals (volunteer_id, referred_type, referred_id, referred_name, referred_email)
  values (v.id, case when tg_table_name = 'members' then 'member' else 'volunteer' end, new.id, new.full_name, lower(new.email))
  on conflict (volunteer_id, referred_email) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return new; end if;

  select count(*) into new_count from public.volunteer_referrals where volunteer_id = v.id;
  new_level := new_count / 4;
  update public.volunteer_applications set referral_count = new_count, badge_level = new_level where id = v.id;
  if new_level > 0 and new_count % 4 = 0 then
    insert into public.volunteer_rewards (volunteer_id, level, amount, currency)
    values (v.id, new_level, 100, 'GHS') on conflict (volunteer_id, level) do nothing;
  end if;
  return new;
end $$;
revoke execute on function public.record_referral() from public, anon, authenticated;
create trigger trg_volunteer_referral after insert on public.volunteer_applications
  for each row execute function public.record_referral();
create trigger trg_member_referral after insert on public.members
  for each row execute function public.record_referral();

-- Lets a volunteer check their own progress with their private code.
create or replace function public.get_referral_progress(_code text)
returns table (first_name text, referral_count integer, badge_level integer, rewards_earned integer, rewards_paid integer)
language sql stable security definer set search_path = public as $$
  select split_part(v.full_name, ' ', 1), v.referral_count, v.badge_level,
    (select count(*)::int from public.volunteer_rewards r where r.volunteer_id = v.id and r.status <> 'declined'),
    (select count(*)::int from public.volunteer_rewards r where r.volunteer_id = v.id and r.status = 'paid')
  from public.volunteer_applications v
  where v.referral_code = upper(trim(_code)) and v.status <> 'archived'
$$;
grant execute on function public.get_referral_progress(text) to anon, authenticated;