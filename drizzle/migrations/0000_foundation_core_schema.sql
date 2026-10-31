
-- ============ ROLES ============
create type public.app_role as enum ('super_admin','foundation_admin','programme_manager','finance_officer','volunteer_coordinator','editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.has_any_role(_user_id uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = any(_roles))
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create policy "Users read own roles; admins read all" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create policy "Super admins assign roles" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));
create policy "Super admins remove roles" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create or replace function public.prevent_last_super_admin_removal()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'super_admin' and (select count(*) from public.user_roles where role = 'super_admin') <= 1 then
    raise exception 'At least one Super Admin must remain.';
  end if;
  return old;
end $$;
create trigger trg_prevent_last_super_admin before delete on public.user_roles
  for each row execute function public.prevent_last_super_admin_removal();

-- Initial super admin bootstrap (public sign-up is disabled; only owner-created accounts exist)
create or replace function public.super_admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'super_admin')
$$;

create or replace function public.claim_initial_super_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from public.user_roles where role = 'super_admin') then
    raise exception 'A Super Admin already exists.';
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'super_admin');
  return true;
end $$;
revoke execute on function public.claim_initial_super_admin() from anon, public;
grant execute on function public.claim_initial_super_admin() to authenticated;

-- ============ SHARED HELPERS ============
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ============ USER PROFILES ============
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  job_title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.user_profiles to authenticated;
grant all on public.user_profiles to service_role;
alter table public.user_profiles enable row level security;
create policy "Read own profile or admins read all" on public.user_profiles for select to authenticated
  using (id = auth.uid() or public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create policy "Update own profile or super admin" on public.user_profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'super_admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(), 'super_admin'));
create trigger trg_profiles_updated before update on public.user_profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============ AUDIT LOGS ============
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "Admins read audit logs" on public.audit_logs for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create index idx_audit_created on public.audit_logs (created_at desc);

create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_id text;
  v_changed jsonb;
  v_details jsonb := '{}'::jsonb;
begin
  if v_uid is null then return coalesce(new, old); end if;
  if tg_op = 'DELETE' then v_id := to_jsonb(old)->>'id'; else v_id := to_jsonb(new)->>'id'; end if;
  if tg_op = 'UPDATE' then
    select coalesce(jsonb_agg(n.key), '[]'::jsonb) into v_changed
      from jsonb_each(to_jsonb(new)) n
      where n.value is distinct from (to_jsonb(old)->n.key) and n.key <> 'updated_at';
    v_details := jsonb_build_object('changed_fields', v_changed);
    if (to_jsonb(new) ? 'status') and (to_jsonb(new)->>'status') is distinct from (to_jsonb(old)->>'status') then
      v_details := v_details || jsonb_build_object('status_from', to_jsonb(old)->>'status', 'status_to', to_jsonb(new)->>'status');
    end if;
    if (to_jsonb(new) ? 'is_archived') and (to_jsonb(new)->>'is_archived') is distinct from (to_jsonb(old)->>'is_archived') then
      v_details := v_details || jsonb_build_object('archived', to_jsonb(new)->>'is_archived');
    end if;
  elsif tg_op = 'INSERT' and tg_table_name = 'user_roles' then
    v_details := jsonb_build_object('user_id', to_jsonb(new)->>'user_id', 'role', to_jsonb(new)->>'role');
  elsif tg_op = 'DELETE' and tg_table_name = 'user_roles' then
    v_details := jsonb_build_object('user_id', to_jsonb(old)->>'user_id', 'role', to_jsonb(old)->>'role');
  end if;
  insert into public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, details)
  values (v_uid, (select email from public.user_profiles where id = v_uid), lower(tg_op), tg_table_name, v_id, v_details);
  return coalesce(new, old);
end $$;

create trigger trg_audit_user_roles after insert or delete on public.user_roles for each row execute function public.log_audit();
create trigger trg_audit_user_profiles after update on public.user_profiles for each row execute function public.log_audit();

-- ============ ORGANIZATION SETTINGS ============
create table public.organization_settings (
  id uuid primary key default gen_random_uuid(),
  contact_email text,
  contact_phone text,
  office_address text,
  facebook_url text,
  instagram_url text,
  x_url text,
  tiktok_url text,
  youtube_url text,
  whatsapp_url text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.organization_settings to anon;
grant select, update on public.organization_settings to authenticated;
grant all on public.organization_settings to service_role;
alter table public.organization_settings enable row level security;
create policy "Anyone reads organization settings" on public.organization_settings for select to anon, authenticated using (true);
create policy "Admins update organization settings" on public.organization_settings for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create trigger trg_settings_updated before update on public.organization_settings for each row execute function public.set_updated_at();
create trigger trg_audit_settings after update on public.organization_settings for each row execute function public.log_audit();
insert into public.organization_settings (contact_email) values (null);

-- ============ MEMBERS ============
create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  phone text not null check (char_length(phone) between 7 and 20),
  community text not null check (char_length(community) between 2 and 120),
  occupation text check (char_length(occupation) <= 120),
  interests text check (char_length(interests) <= 1000),
  motivation text check (char_length(motivation) <= 2000),
  consent boolean not null default false,
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected','info_requested','archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.members to anon;
grant select, insert, update on public.members to authenticated;
grant all on public.members to service_role;
alter table public.members enable row level security;
create policy "Public submits membership applications" on public.members for insert to anon, authenticated
  with check (consent = true and status = 'pending_review' and admin_notes is null);
create policy "Membership staff read members" on public.members for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator']::public.app_role[]));
create policy "Membership staff update members" on public.members for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator']::public.app_role[]));
create trigger trg_members_updated before update on public.members for each row execute function public.set_updated_at();
create trigger trg_audit_members after update on public.members for each row execute function public.log_audit();
create index idx_members_status on public.members (status);

-- ============ VOLUNTEERS ============
create table public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  phone text not null check (char_length(phone) between 7 and 20),
  community text not null check (char_length(community) between 2 and 120),
  areas_of_interest text[] not null default '{}',
  experience text check (char_length(experience) <= 2000),
  availability text not null check (char_length(availability) between 2 and 200),
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','under_review','accepted','declined','archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.volunteer_applications to anon;
grant select, insert, update on public.volunteer_applications to authenticated;
grant all on public.volunteer_applications to service_role;
alter table public.volunteer_applications enable row level security;
create policy "Public submits volunteer applications" on public.volunteer_applications for insert to anon, authenticated
  with check (consent = true and status = 'new' and admin_notes is null);
create policy "Volunteer staff read" on public.volunteer_applications for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator']::public.app_role[]));
create policy "Volunteer staff update" on public.volunteer_applications for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','volunteer_coordinator']::public.app_role[]));
create trigger trg_volunteers_updated before update on public.volunteer_applications for each row execute function public.set_updated_at();
create trigger trg_audit_volunteers after update on public.volunteer_applications for each row execute function public.log_audit();

-- ============ PROGRAMMES ============
create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  summary text check (char_length(summary) <= 500),
  description text,
  category text,
  status text not null default 'planned' check (status in ('planned','active','paused','completed')),
  registration_status text not null default 'coming_soon' check (registration_status in ('open','closed','coming_soon')),
  is_flagship boolean not null default false,
  sort_order int not null default 100,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.programmes to anon;
grant select, insert, update on public.programmes to authenticated;
grant all on public.programmes to service_role;
alter table public.programmes enable row level security;
create policy "Public reads live programmes" on public.programmes for select to anon, authenticated using (is_archived = false);
create policy "Programme staff read all programmes" on public.programmes for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff insert" on public.programmes for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff update" on public.programmes for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create trigger trg_programmes_updated before update on public.programmes for each row execute function public.set_updated_at();
create trigger trg_audit_programmes after insert or update on public.programmes for each row execute function public.log_audit();

insert into public.programmes (title, slug, summary, category, status, registration_status, is_flagship, sort_order) values
 ('Arise Ashaiman Mentorship & Communication Clinic','mentorship-communication-clinic','Our flagship programme: quarterly clinics and one major annual workshop building communication, leadership and civic skills in young people.','Mentorship','planned','coming_soon',true,1),
 ('Youth Empowerment Initiatives','youth-empowerment','Initiatives that open doors for young people through skills, mentorship, career guidance and entrepreneurship support.','Youth','planned','coming_soon',false,2),
 ('Women in Communication','women-in-communication','A platform to train, mentor and amplify women communicators and community voices across Ashaiman.','Communication','planned','coming_soon',false,3),
 ('Youth in Communication','youth-in-communication','Equipping young communicators with media, fact-checking and public speaking skills.','Communication','planned','coming_soon',false,4),
 ('Civic Education','civic-education','Civic education and awareness activities across electoral areas to encourage active, informed citizenship.','Civic','planned','coming_soon',false,5),
 ('Community Advocacy','community-advocacy','Constructive advocacy for improved public services, youth opportunities and community development.','Advocacy','planned','coming_soon',false,6),
 ('Community Development Programmes','community-development','Planned community clean-ups, health walks and screenings, and a Skills and Jobs Fair.','Development','planned','coming_soon',false,7);

-- ============ PROGRAMME APPLICATIONS ============
create table public.programme_applications (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.programmes(id) on delete set null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  phone text not null check (char_length(phone) between 7 and 20),
  participant_category text not null check (char_length(participant_category) <= 120),
  institution text check (char_length(institution) <= 200),
  community text check (char_length(community) <= 120),
  motivation text check (char_length(motivation) <= 2000),
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','shortlisted','accepted','declined','archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.programme_applications to anon;
grant select, insert, update on public.programme_applications to authenticated;
grant all on public.programme_applications to service_role;
alter table public.programme_applications enable row level security;
create policy "Public registers programme interest" on public.programme_applications for insert to anon, authenticated
  with check (consent = true and status = 'new' and admin_notes is null);
create policy "Programme staff read applications" on public.programme_applications for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff update applications" on public.programme_applications for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create trigger trg_prog_apps_updated before update on public.programme_applications for each row execute function public.set_updated_at();
create trigger trg_audit_prog_apps after update on public.programme_applications for each row execute function public.log_audit();

-- ============ PROJECTS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 200),
  description text,
  location text,
  category text,
  image_url text,
  start_date date,
  completion_date date,
  status text not null default 'planned' check (status in ('planned','ongoing','completed','on_hold')),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.projects to anon;
grant select, insert, update on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "Public reads live projects" on public.projects for select to anon, authenticated using (is_archived = false);
create policy "Programme staff read all projects" on public.projects for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff insert projects" on public.projects for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff update projects" on public.projects for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create trigger trg_projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger trg_audit_projects after insert or update on public.projects for each row execute function public.log_audit();

-- ============ EVENTS ============
create table public.events (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.programmes(id) on delete set null,
  title text not null check (char_length(title) between 2 and 200),
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  capacity int check (capacity is null or capacity > 0),
  registration_status text not null default 'coming_soon' check (registration_status in ('open','closed','coming_soon')),
  status text not null default 'scheduled' check (status in ('scheduled','postponed','cancelled','completed')),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon;
grant select, insert, update on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Public reads live events" on public.events for select to anon, authenticated using (is_archived = false);
create policy "Programme staff read all events" on public.events for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff insert events" on public.events for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff update events" on public.events for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create trigger trg_events_updated before update on public.events for each row execute function public.set_updated_at();
create trigger trg_audit_events after insert or update on public.events for each row execute function public.log_audit();
create index idx_events_start on public.events (start_at);

-- ============ EVENT REGISTRATIONS ============
create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  phone text check (phone is null or char_length(phone) between 7 and 20),
  consent boolean not null default false,
  status text not null default 'registered' check (status in ('registered','confirmed','cancelled','waitlisted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, email)
);
grant insert on public.event_registrations to anon;
grant select, insert, update on public.event_registrations to authenticated;
grant all on public.event_registrations to service_role;
alter table public.event_registrations enable row level security;
create policy "Public registers for open events" on public.event_registrations for insert to anon, authenticated
  with check (consent = true and status = 'registered' and exists (
    select 1 from public.events e where e.id = event_id and e.is_archived = false and e.registration_status = 'open'));
create policy "Programme staff read registrations" on public.event_registrations for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff update registrations" on public.event_registrations for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create trigger trg_regs_updated before update on public.event_registrations for each row execute function public.set_updated_at();
create trigger trg_audit_regs after update on public.event_registrations for each row execute function public.log_audit();

-- ============ ATTENDANCE ============
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.event_registrations(id) on delete set null,
  attendee_name text not null check (char_length(attendee_name) between 2 and 120),
  attended boolean not null default true,
  checked_in_at timestamptz default now(),
  notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.attendance to authenticated;
grant all on public.attendance to service_role;
alter table public.attendance enable row level security;
create policy "Programme staff manage attendance select" on public.attendance for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff manage attendance insert" on public.attendance for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create policy "Programme staff manage attendance update" on public.attendance for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','programme_manager']::public.app_role[]));
create trigger trg_attendance_updated before update on public.attendance for each row execute function public.set_updated_at();
create trigger trg_audit_attendance after insert or update on public.attendance for each row execute function public.log_audit();

-- ============ DONATIONS ============
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text check (char_length(donor_name) <= 200),
  is_anonymous boolean not null default false,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'GHS' check (currency = 'GHS'),
  donation_date date not null default current_date,
  purpose text check (char_length(purpose) <= 300),
  payment_method text not null default 'cash' check (payment_method in ('cash','mobile_money','bank_transfer','cheque','in_kind','other')),
  reference text check (char_length(reference) <= 120),
  notes text,
  recorded_by uuid default auth.uid(),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.donations to authenticated;
grant all on public.donations to service_role;
alter table public.donations enable row level security;
create policy "Finance reads donations" on public.donations for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create policy "Finance records donations" on public.donations for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create policy "Finance updates donations" on public.donations for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create trigger trg_donations_updated before update on public.donations for each row execute function public.set_updated_at();
create trigger trg_audit_donations after insert or update on public.donations for each row execute function public.log_audit();

-- ============ EXPENSES ============
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null check (char_length(description) between 2 and 300),
  category text,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'GHS' check (currency = 'GHS'),
  expense_date date not null default current_date,
  payee text,
  payment_method text not null default 'cash' check (payment_method in ('cash','mobile_money','bank_transfer','cheque','other')),
  reference text,
  notes text,
  recorded_by uuid default auth.uid(),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.expenses to authenticated;
grant all on public.expenses to service_role;
alter table public.expenses enable row level security;
create policy "Finance reads expenses" on public.expenses for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create policy "Finance records expenses" on public.expenses for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create policy "Finance updates expenses" on public.expenses for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','finance_officer']::public.app_role[]));
create trigger trg_expenses_updated before update on public.expenses for each row execute function public.set_updated_at();
create trigger trg_audit_expenses after insert or update on public.expenses for each row execute function public.log_audit();

-- ============ NEWS ============
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  excerpt text check (char_length(excerpt) <= 400),
  content text not null default '',
  featured_image_url text,
  category text not null default 'Announcement',
  author_name text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.news_posts to anon;
grant select, insert, update on public.news_posts to authenticated;
grant all on public.news_posts to service_role;
alter table public.news_posts enable row level security;
create policy "Public reads published news" on public.news_posts for select to anon, authenticated using (status = 'published');
create policy "Editors read all news" on public.news_posts for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','editor']::public.app_role[]));
create policy "Editors create news" on public.news_posts for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','editor']::public.app_role[]));
create policy "Editors update news" on public.news_posts for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','editor']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin','editor']::public.app_role[]));
create or replace function public.news_set_published_at()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'published' and new.published_at is null then new.published_at = now(); end if;
  return new;
end $$;
create trigger trg_news_published before insert or update on public.news_posts for each row execute function public.news_set_published_at();
create trigger trg_news_updated before update on public.news_posts for each row execute function public.set_updated_at();
create trigger trg_audit_news after insert or update on public.news_posts for each row execute function public.log_audit();

-- ============ COMMUNITY FEEDBACK ============
create table public.community_feedback (
  id uuid primary key default gen_random_uuid(),
  community text not null check (char_length(community) between 2 and 120),
  category text not null check (category in ('roads_infrastructure','sanitation_environment','education','health','youth_development','employment_skills','public_services','accountability','other')),
  description text not null check (char_length(description) between 10 and 4000),
  submitter_name text check (char_length(submitter_name) <= 120),
  submitter_contact text check (char_length(submitter_contact) <= 255),
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','under_review','referred','resolved','closed')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.community_feedback to anon;
grant select, insert, update on public.community_feedback to authenticated;
grant all on public.community_feedback to service_role;
alter table public.community_feedback enable row level security;
create policy "Residents submit feedback" on public.community_feedback for insert to anon, authenticated
  with check (consent = true and status = 'new' and internal_notes is null);
create policy "Admins read feedback" on public.community_feedback for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create policy "Admins update feedback" on public.community_feedback for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create trigger trg_feedback_updated before update on public.community_feedback for each row execute function public.set_updated_at();
create trigger trg_audit_feedback after update on public.community_feedback for each row execute function public.log_audit();

-- ============ CONTACT ENQUIRIES ============
create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_type text not null default 'general' check (enquiry_type in ('general','partnership','media','other')),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  phone text check (phone is null or char_length(phone) between 7 and 20),
  organisation text check (char_length(organisation) <= 200),
  subject text not null check (char_length(subject) between 2 and 200),
  message text not null check (char_length(message) between 10 and 4000),
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','in_progress','resolved','archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.contact_enquiries to anon;
grant select, insert, update on public.contact_enquiries to authenticated;
grant all on public.contact_enquiries to service_role;
alter table public.contact_enquiries enable row level security;
create policy "Public sends enquiries" on public.contact_enquiries for insert to anon, authenticated
  with check (consent = true and status = 'new' and admin_notes is null);
create policy "Admins read enquiries" on public.contact_enquiries for select to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create policy "Admins update enquiries" on public.contact_enquiries for update to authenticated
  using (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]))
  with check (public.has_any_role(auth.uid(), array['super_admin','foundation_admin']::public.app_role[]));
create trigger trg_enquiries_updated before update on public.contact_enquiries for each row execute function public.set_updated_at();
create trigger trg_audit_enquiries after update on public.contact_enquiries for each row execute function public.log_audit();
