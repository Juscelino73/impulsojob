create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null check (char_length(title) between 1 and 300),
  company text,
  location text,
  work_mode text check (work_mode in ('remoto','hibrido','presencial')),
  seniority text,
  contract_type text,
  salary text,
  url text,
  source text not null default 'manual' check (source in ('manual','url','colado')),
  description text not null default '' check (char_length(description) <= 40000),
  requirements jsonb not null default '{}'::jsonb,
  status text not null default 'ativa' check (status in ('ativa','salva','descartada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid not null references public.jobs(id) on delete cascade,
  score int not null check (score between 0 and 100),
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (job_id)
);
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  changes jsonb not null default '[]'::jsonb,
  ats jsonb,
  versions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid references public.jobs(id) on delete set null,
  resume_id uuid references public.resumes(id) on delete set null,
  company text not null,
  role text not null,
  url text,
  status text not null default 'salva' check (status in ('salva','preparacao','candidatado','entrevista','oferta','rejeitado','desistencia')),
  applied_at date,
  interview_at date,
  follow_up_at date,
  notes text,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  label text not null,
  created_at timestamptz not null default now()
);
create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  operation text not null,
  created_at timestamptz not null default now()
);
create index on public.jobs(user_id, created_at desc);
create index on public.job_matches(user_id);
create index on public.resumes(user_id);
create index on public.applications(user_id);
create index on public.activity_events(user_id, created_at desc);
create index on public.ai_usage_events(user_id, created_at desc);

do $$ declare t text; begin
  foreach t in array array['profiles','jobs','job_matches','resumes','applications','activity_events','ai_usage_events'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows select" on public.%I for select to authenticated using (user_id = auth.uid())', t);
    execute format('create policy "own rows insert" on public.%I for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy "own rows update" on public.%I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create policy "own rows delete" on public.%I for delete to authenticated using (user_id = auth.uid())', t);
  end loop;
  foreach t in array array['profiles','jobs','resumes','applications'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;