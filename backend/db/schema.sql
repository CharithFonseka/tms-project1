-- ============================================================================
-- TMS (tms-project1) — Supabase / PostgreSQL schema
-- ----------------------------------------------------------------------------
-- Safe to run on an empty project (Part A) AND on an existing one (Part B):
-- everything is idempotent (IF NOT EXISTS / guarded constraint adds).
--
-- IMPORTANT: table names are CASE-SENSITIVE PascalCase because the backend
-- queries them as "Users", "Tasks", etc. via the Supabase client. Do not
-- rename them to lowercase or the API will 404.
--
-- Column names match what the CODE actually uses (these differ from the SRS
-- prose in a few places):
--   * Users.password        (hashed; NOT "password_hash")
--   * Comments.content       (NOT "body")
--   * Attachments.uploaded_by(NOT "user_id")
-- ============================================================================

create extension if not exists pgcrypto;  -- provides gen_random_uuid()

-- ============================================================================
-- PART A — Fresh install (creates tables only if missing)
-- ============================================================================

-- Users -----------------------------------------------------------------------
create table if not exists "Users" (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  email                text not null unique,
  password             text not null,                       -- bcrypt hash
  role                 text not null
                       check (role in ('Admin','Project Manager','Collaborator')),
  is_active            boolean not null default true,
  must_reset_password  boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Projects --------------------------------------------------------------------
create table if not exists "Projects" (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_by  uuid references "Users"(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (created_by, name)                                 -- name unique per creator (SRS)
);

-- Tasks -----------------------------------------------------------------------
create table if not exists "Tasks" (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references "Projects"(id) on delete cascade,  -- nullable (backward compat)
  title       text not null,
  description text,
  status      text not null default 'To Do'
              check (status in ('To Do','In Progress','Completed')),
  priority    text not null default 'Medium'
              check (priority in ('Low','Medium','High')),
  due_date    date,
  created_by  uuid references "Users"(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- TaskAssignments (many-to-many Tasks <-> Users) ------------------------------
create table if not exists "TaskAssignments" (
  task_id uuid not null references "Tasks"(id) on delete cascade,
  user_id uuid not null references "Users"(id) on delete cascade,
  primary key (task_id, user_id)
);

-- Comments --------------------------------------------------------------------
create table if not exists "Comments" (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references "Tasks"(id) on delete cascade,
  user_id    uuid not null references "Users"(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Attachments -----------------------------------------------------------------
create table if not exists "Attachments" (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references "Tasks"(id) on delete cascade,
  uploaded_by uuid references "Users"(id) on delete set null,
  file_name   text not null,
  file_url    text not null,
  file_size   bigint,                                        -- optional (SRS); not set by code yet
  created_at  timestamptz not null default now()
);

-- Notifications ---------------------------------------------------------------
create table if not exists "Notifications" (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references "Users"(id) on delete cascade,
  message    text not null,
  type       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PART B — Migration: bring an EXISTING database up to date
-- (adds anything the table is missing; no-ops if already present)
-- ============================================================================

-- Users
alter table "Users" add column if not exists is_active           boolean not null default true;
alter table "Users" add column if not exists must_reset_password boolean not null default true;
alter table "Users" add column if not exists created_at          timestamptz not null default now();
alter table "Users" add column if not exists updated_at          timestamptz not null default now();

-- Tasks
alter table "Tasks" add column if not exists project_id  uuid;
alter table "Tasks" add column if not exists status      text not null default 'To Do';
alter table "Tasks" add column if not exists priority    text not null default 'Medium';
alter table "Tasks" add column if not exists created_at  timestamptz not null default now();
alter table "Tasks" add column if not exists updated_at  timestamptz not null default now();

-- Comments
alter table "Comments" add column if not exists content    text;
alter table "Comments" add column if not exists created_at timestamptz not null default now();
alter table "Comments" add column if not exists updated_at timestamptz not null default now();

-- Attachments
alter table "Attachments" add column if not exists uploaded_by uuid;
alter table "Attachments" add column if not exists file_size   bigint;
alter table "Attachments" add column if not exists created_at  timestamptz not null default now();

-- Notifications
alter table "Notifications" add column if not exists type       text;
alter table "Notifications" add column if not exists is_read    boolean not null default false;
alter table "Notifications" add column if not exists created_at timestamptz not null default now();

-- Guarded constraints / FKs (skip if they already exist) ----------------------
do $$ begin
  alter table "Tasks" add constraint tasks_project_fk
    foreign key (project_id) references "Projects"(id) on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "Tasks" add constraint tasks_status_chk
    check (status in ('To Do','In Progress','Completed'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "Tasks" add constraint tasks_priority_chk
    check (priority in ('Low','Medium','High'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "Projects" add constraint projects_name_per_creator_uq
    unique (created_by, name);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- updated_at auto-touch trigger
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['Users','Projects','Tasks','Comments'] loop
    execute format('drop trigger if exists trg_set_updated_at on %I', t);
    execute format(
      'create trigger trg_set_updated_at before update on %I
         for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- Storage bucket for attachments (backend uses "task-attachments", private)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- The backend talks to Postgres with the SERVICE ROLE key, which BYPASSES RLS,
-- and the frontend never connects to Supabase directly. Enabling RLS with no
-- policies is therefore safe (service role still has full access) and blocks
-- any accidental anon/authenticated key usage — defense in depth.
-- ============================================================================
alter table "Users"           enable row level security;
alter table "Projects"        enable row level security;
alter table "Tasks"           enable row level security;
alter table "TaskAssignments" enable row level security;
alter table "Comments"        enable row level security;
alter table "Attachments"     enable row level security;
alter table "Notifications"   enable row level security;

-- ============================================================================
-- OPTIONAL seed: initial admin (or run `node backend/seed.js`).
-- Password below is bcrypt for 'Admin@123!'. Change it after first login.
-- ============================================================================
-- insert into "Users" (name, email, password, role, is_active, must_reset_password)
-- values ('System Admin', 'admin@example.com',
--         '$2a$10$REPLACE_WITH_A_REAL_BCRYPT_HASH', 'Admin', true, false)
-- on conflict (email) do nothing;
