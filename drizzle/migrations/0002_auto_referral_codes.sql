create or replace function public.gen_referral_code()
returns text language plpgsql volatile set search_path = public as $$
declare chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int;
begin
  loop
    c := '';
    for i in 1..8 loop c := c || substr(chars, 1 + floor(random()*32)::int, 1); end loop;
    exit when not exists (select 1 from public.volunteer_applications where referral_code = c);
  end loop;
  return c;
end $$;

create or replace function public.volunteer_ensure_code()
returns trigger language plpgsql set search_path = public as $$
begin
  new.referral_code := nullif(upper(trim(new.referral_code)), '');
  if new.referral_code is null or exists (select 1 from public.volunteer_applications where referral_code = new.referral_code) then
    new.referral_code := public.gen_referral_code();
  end if;
  return new;
end $$;
create trigger trg_volunteer_ensure_code before insert on public.volunteer_applications
  for each row execute function public.volunteer_ensure_code();

update public.volunteer_applications set referral_code = public.gen_referral_code() where referral_code is null;

create or replace function public.referral_code_exists(_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.volunteer_applications where referral_code = upper(trim(_code)) and status <> 'archived')
$$;
grant execute on function public.referral_code_exists(text) to anon, authenticated;