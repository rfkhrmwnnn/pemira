-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Jurusan
create table jurusan (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  code text not null unique,
  created_at timestamp with time zone default now()
);

-- 2. Profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nim text unique not null,
  full_name text not null,
  jurusan_id uuid references jurusan(id),
  role text default 'student' check (role in ('student', 'admin', 'super_admin')),
  created_at timestamp with time zone default now()
);

-- 3. UKM
create table ukm (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  code text not null unique,
  description text,
  created_at timestamp with time zone default now()
);

-- 4. UKM Members
create table ukm_members (
  id uuid default uuid_generate_v4() primary key,
  ukm_id uuid references ukm(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(ukm_id, profile_id)
);

-- 5. Pemira Events
create table pemira_events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  academic_year text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 6. Elections
create table elections (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references pemira_events(id) on delete cascade,
  title text not null,
  org_type text not null check (org_type in ('BEM', 'DPM', 'HIMA', 'UKM')),
  jurusan_id uuid references jurusan(id),
  ukm_id uuid references ukm(id),
  status text default 'draft' check (status in ('draft', 'active', 'closed', 'finalized')),
  created_at timestamp with time zone default now()
);

-- 7. Candidates
create table candidates (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references elections(id) on delete cascade,
  name text not null,
  vision text,
  mission text,
  photo_url text,
  order_number integer not null,
  created_at timestamp with time zone default now(),
  unique(election_id, order_number)
);

-- 8. Votes (Immutable)
create table votes (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references elections(id),
  candidate_id uuid references candidates(id),
  voter_id uuid references profiles(id),
  vote_hash text not null,
  receipt_hash text not null unique,
  previous_hash text,
  voted_at timestamp with time zone default now(),
  unique(election_id, voter_id)
);

-- 9. Election Approvals
create table election_approvals (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references elections(id) on delete cascade,
  admin_id uuid references profiles(id),
  approved_at timestamp with time zone default now(),
  unique(election_id, admin_id)
);

-- 10. Election Snapshots
create table election_snapshots (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references elections(id) unique,
  merkle_root text not null,
  signature text not null,
  finalized_by uuid references profiles(id),
  finalized_at timestamp with time zone default now()
);

-- 11. Document Registry
create table document_registry (
  id uuid default uuid_generate_v4() primary key,
  doc_number text not null unique,
  content_hash text not null,
  signature text not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- 12. Audit Logs
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id),
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table jurusan enable row level security;
alter table profiles enable row level security;
alter table ukm enable row level security;
alter table ukm_members enable row level security;
alter table pemira_events enable row level security;
alter table elections enable row level security;
alter table candidates enable row level security;
alter table votes enable row level security;
alter table election_approvals enable row level security;
alter table election_snapshots enable row level security;
alter table document_registry enable row level security;
alter table audit_logs enable row level security;

-- Policies
-- (Basic policies: Authenticated users can read everything except votes details)
create policy "Public read" on jurusan for select using (true);
create policy "Public read" on profiles for select using (true);
create policy "Public read" on ukm for select using (true);
create policy "Public read" on ukm_members for select using (true);
create policy "Public read" on pemira_events for select using (true);
create policy "Public read" on elections for select using (true);
create policy "Public read" on candidates for select using (true);
create policy "Public read" on document_registry for select using (true);
create policy "Public read" on election_snapshots for select using (true);

-- Profiles policy: users can update their own profile (maybe restricted)
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Votes: ONLY via RPC (SECURITY DEFINER)
-- We'll allow users to see IF they have voted, but not for whom or others' votes if needed.
-- But the requirement says "No candidate result until finalized".
create policy "Users can see if они voted" on votes for select using (auth.uid() = voter_id);

-- Audit logs: Admin only
create policy "Admins can see audit logs" on audit_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
