-- Initial schema for a NEW Precision Building Supabase project.
-- Execute once in SQL Editor. Do not execute on HousePro.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create table public.organizations(id uuid primary key default gen_random_uuid(),name text not null);
create table public.memberships(organization_id uuid references public.organizations on delete cascade,user_id uuid references auth.users on delete cascade,role text not null check(role in('admin','staff','client')),primary key(organization_id,user_id));
create table public.projects(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations,name text not null check(length(name) between 1 and 200),client_name text not null,location text not null,service text not null check(service in('LSF','Reabilitação','Renovação')),status text not null default 'pendente',budget numeric(14,2) not null default 0 check(budget>=0),start_date date,end_date date,created_at timestamptz not null default now(),check(end_date is null or start_date is null or end_date>=start_date));
create table public.project_clients(project_id uuid references public.projects on delete cascade,user_id uuid references auth.users on delete cascade,primary key(project_id,user_id));
create table public.work_items(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects on delete cascade,kind text not null check(kind in('fase','decisao','reuniao','pagamento','documento','atualizacao')),title text not null check(length(title) between 1 and 200),description text not null default '' check(length(description)<=4000),status text not null default 'pendente' check(status in('pendente','em_curso','concluido','aprovado','recusado','pago')),due_date date,amount numeric(14,2) check(amount>=0),position integer not null default 0,visible_to_client boolean not null default true,response text check(length(response)<=4000),responded_by uuid references auth.users,responded_at timestamptz,created_at timestamptz not null default now(),check(kind<>'pagamento' or amount is not null));
create table public.leads(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations,name text not null,email text not null,phone text not null default '',service text not null,message text not null default '',stage text not null default 'novo' check(stage in('novo','contactado','visita','proposta','ganho','perdido')),created_at timestamptz not null default now());
create table public.audit_log(id bigint generated always as identity primary key,organization_id uuid not null references public.organizations,actor_id uuid references auth.users,table_name text not null,record_id uuid not null,action text not null,before_data jsonb,after_data jsonb,created_at timestamptz not null default now());
create index projects_org_idx on public.projects(organization_id);
create index work_items_project_idx on public.work_items(project_id);
create index project_clients_user_idx on public.project_clients(user_id);
create index memberships_user_idx on public.memberships(user_id);
create index leads_org_idx on public.leads(organization_id);
create index audit_org_idx on public.audit_log(organization_id);
-- Internal authorization helpers, not exposed through the Data API.
create function private.is_staff(org uuid) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and exists(select 1 from public.memberships where organization_id=org and user_id=auth.uid() and role in('admin','staff'));$$;
create function private.can_view_project(pid uuid) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and exists(select 1 from public.projects p where p.id=pid and(private.is_staff(p.organization_id) or exists(select 1 from public.project_clients c where c.project_id=pid and c.user_id=auth.uid())));$$;
create function private.can_edit_project(pid uuid) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and exists(select 1 from public.projects where id=pid and private.is_staff(organization_id));$$;
revoke all on function private.is_staff(uuid),private.can_view_project(uuid),private.can_edit_project(uuid) from public,anon;
grant execute on function private.is_staff(uuid),private.can_view_project(uuid),private.can_edit_project(uuid) to authenticated;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_clients enable row level security;
alter table public.work_items enable row level security;
alter table public.leads enable row level security;
alter table public.audit_log enable row level security;
create policy org_read on public.organizations for select to authenticated using(exists(select 1 from public.memberships m where m.organization_id=id and m.user_id=(select auth.uid())));
create policy membership_read on public.memberships for select to authenticated using(user_id=(select auth.uid()));
create policy project_read on public.projects for select to authenticated using(private.can_view_project(id));
create policy project_insert on public.projects for insert to authenticated with check(private.is_staff(organization_id));
create policy project_update on public.projects for update to authenticated using(private.is_staff(organization_id)) with check(private.is_staff(organization_id));
create policy project_client_read on public.project_clients for select to authenticated using(user_id=(select auth.uid()) or private.can_edit_project(project_id));
create policy item_read on public.work_items for select to authenticated using(private.can_edit_project(project_id) or(visible_to_client and private.can_view_project(project_id)));
create policy item_insert on public.work_items for insert to authenticated with check(private.can_edit_project(project_id));
create policy item_update on public.work_items for update to authenticated using(private.can_edit_project(project_id)) with check(private.can_edit_project(project_id));
create policy lead_read on public.leads for select to authenticated using(private.is_staff(organization_id));
create policy lead_insert on public.leads for insert to authenticated with check(private.is_staff(organization_id));
create policy lead_update on public.leads for update to authenticated using(private.is_staff(organization_id)) with check(private.is_staff(organization_id));
create policy audit_read on public.audit_log for select to authenticated using(private.is_staff(organization_id));
revoke all on public.organizations,public.memberships,public.projects,public.project_clients,public.work_items,public.leads,public.audit_log from anon,authenticated;
grant select on public.organizations,public.memberships,public.project_clients,public.audit_log to authenticated;
grant select,insert,update on public.projects,public.work_items,public.leads to authenticated;
-- Privileged decision update lives in private; public RPC is an invoker wrapper.
create function private.respond_to_decision(decision_id uuid,answer text,comment text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or answer not in('aprovado','recusado') or length(comment)>4000 then raise exception 'Resposta inválida';end if;
 update public.work_items w set status=answer,response=coalesce(comment,''),responded_by=auth.uid(),responded_at=now()
 where w.id=decision_id and w.kind='decisao' and w.status='pendente' and w.visible_to_client and exists(select 1 from public.project_clients c where c.project_id=w.project_id and c.user_id=auth.uid());
 if not found then raise exception 'Decisão indisponível ou sem autorização';end if;
end;$$;
create function public.respond_to_decision(decision_id uuid,answer text,comment text) returns void language sql security invoker set search_path='' as $$select private.respond_to_decision(decision_id,answer,comment);$$;
create function private.grant_project_access(target_project uuid,customer_email text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid;org uuid;
begin
 if not private.can_edit_project(target_project) then raise exception 'Sem autorização';end if;
 select id into uid from auth.users where lower(email)=lower(customer_email);
 if uid is null then raise exception 'Crie primeiro a conta do cliente no Supabase Auth';end if;
 select organization_id into org from public.projects where id=target_project;
 insert into public.memberships values(org,uid,'client') on conflict do nothing;
 insert into public.project_clients values(target_project,uid) on conflict do nothing;
end;$$;
create function public.grant_project_access(target_project uuid,customer_email text) returns void language sql security invoker set search_path='' as $$select private.grant_project_access(target_project,customer_email);$$;
create function public.create_project(org_id uuid,project_name text,customer_name text,project_location text,project_service text,project_budget numeric,starts date,ends date,phase_titles text[]) returns uuid language plpgsql security invoker set search_path='' as $$
declare pid uuid;
begin
 if not private.is_staff(org_id) then raise exception 'Sem autorização';end if;
 if cardinality(phase_titles)>30 then raise exception 'Número de fases inválido';end if;
 insert into public.projects(organization_id,name,client_name,location,service,budget,start_date,end_date) values(org_id,project_name,customer_name,project_location,project_service,project_budget,starts,ends) returning id into pid;
 insert into public.work_items(project_id,kind,title,position) select pid,'fase',title,(ordinality-1)::integer from unnest(phase_titles) with ordinality as p(title,ordinality);
 return pid;
end;$$;
revoke all on function private.respond_to_decision(uuid,text,text),private.grant_project_access(uuid,text),public.respond_to_decision(uuid,text,text),public.grant_project_access(uuid,text),public.create_project(uuid,text,text,text,text,numeric,date,date,text[]) from public,anon;
grant execute on function private.respond_to_decision(uuid,text,text),private.grant_project_access(uuid,text),public.respond_to_decision(uuid,text,text),public.grant_project_access(uuid,text),public.create_project(uuid,text,text,text,text,numeric,date,date,text[]) to authenticated;
-- Append-only database audit: clients cannot forge or modify history.
create function private.record_audit() returns trigger language plpgsql security definer set search_path='' as $$
declare org uuid;pid uuid;rid uuid;
begin
 rid:=coalesce(new.id,old.id);
 if tg_table_name in('projects','leads') then org:=coalesce(new.organization_id,old.organization_id);
 else pid:=coalesce(new.project_id,old.project_id);select organization_id into org from public.projects where id=pid;end if;
 insert into public.audit_log(organization_id,actor_id,table_name,record_id,action,before_data,after_data) values(org,auth.uid(),tg_table_name,rid,tg_op,case when tg_op<>'INSERT' then to_jsonb(old) end,case when tg_op<>'DELETE' then to_jsonb(new) end);
 return coalesce(new,old);
end;$$;
revoke all on function private.record_audit() from public,anon,authenticated;
create trigger projects_audit after insert or update on public.projects for each row execute function private.record_audit();
create trigger items_audit after insert or update on public.work_items for each row execute function private.record_audit();
create trigger leads_audit after insert or update on public.leads for each row execute function private.record_audit();
commit;
