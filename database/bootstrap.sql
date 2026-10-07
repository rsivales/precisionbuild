-- Run AFTER setup.sql and AFTER creating your admin account in Auth > Users.
-- Replace the email. This must run in SQL Editor as project administrator.
do $$
declare org uuid;uid uuid;
begin
 select id into uid from auth.users where lower(email)=lower('SUBSTITUIR_EMAIL_ADMIN');
 if uid is null then raise exception 'Substitua o email e crie primeiro a conta em Auth > Users';end if;
 insert into public.organizations(name) values('Precision Building') returning id into org;
 insert into public.memberships values(org,uid,'admin');
 raise notice 'PRECISION_ORGANIZATION_ID = %',org;
end;$$;
