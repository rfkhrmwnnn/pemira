-- Enable pgcrypto for hashing
create extension if not exists "pgcrypto";

-- Function: secure_vote(election_id, candidate_id)
create or replace function secure_vote(
  p_election_id uuid,
  p_candidate_id uuid
)
returns text -- returns receipt_hash
language plpgsql
security definer -- important: runs with bypass RLS to perform validations
as $$
declare
  v_voter_id uuid;
  v_election_status text;
  v_org_type text;
  v_jurusan_id uuid;
  v_ukm_id uuid;
  v_voter_jurusan_id uuid;
  v_is_ukm_member boolean;
  v_previous_hash text;
  v_vote_hash text;
  v_receipt_hash text;
  v_timestamp timestamp with time zone;
begin
  -- 1. Validate auth.uid()
  v_voter_id := auth.uid();
  if v_voter_id is null then
    raise exception 'Unauthorized';
  end if;

  -- 2. Validate election.status = active
  select status, org_type, jurusan_id, ukm_id 
  into v_election_status, v_org_type, v_jurusan_id, v_ukm_id
  from elections where id = p_election_id;

  if v_election_status is null then
    raise exception 'Election not found';
  end if;

  if v_election_status != 'active' then
    raise exception 'Election is not active';
  end if;

  -- 3. Prevent duplicate vote
  if exists (select 1 from votes where election_id = p_election_id and voter_id = v_voter_id) then
    raise exception 'Already voted in this election';
  end if;

  -- 4. Validate jurusan for HIMA
  if v_org_type = 'HIMA' then
    select jurusan_id into v_voter_jurusan_id from profiles where id = v_voter_id;
    if v_voter_jurusan_id is null or v_voter_jurusan_id != v_jurusan_id then
      raise exception 'Not eligible for this HIMA election';
    end if;
  end if;

  -- 5. Validate UKM membership (Disabled: All students can vote for UKM)
  -- if v_org_type = 'UKM' then
  --   select exists (
  --     select 1 from ukm_members 
  --     where ukm_id = v_ukm_id and profile_id = v_voter_id
  --   ) into v_is_ukm_member;
  --   if not v_is_ukm_member then
  --     raise exception 'Not a member of this UKM';
  --   end if;
  -- end if;

  -- 6. Generate hashes (SHA-256 chain)
  -- Get previous vote hash in this election
  select vote_hash into v_previous_hash 
  from votes 
  where election_id = p_election_id 
  order by voted_at desc limit 1;

  if v_previous_hash is null then
    v_previous_hash := 'GENESIS';
  end if;

  v_timestamp := now();
  
  v_vote_hash := encode(digest(
    v_voter_id::text || p_candidate_id::text || v_previous_hash || v_timestamp::text,
    'sha256'
  ), 'hex');

  v_receipt_hash := encode(digest(
    v_vote_hash || v_voter_id::text || p_election_id::text,
    'sha256'
  ), 'hex');

  -- 8. Insert vote
  insert into votes (election_id, candidate_id, voter_id, vote_hash, receipt_hash, previous_hash, voted_at)
  values (p_election_id, p_candidate_id, v_voter_id, v_vote_hash, v_receipt_hash, v_previous_hash, v_timestamp);

  -- 9. Insert audit log
  insert into audit_logs (profile_id, action, details)
  values (v_voter_id, 'VOTE_CAST', jsonb_build_object('election_id', p_election_id, 'receipt_hash', v_receipt_hash));

  -- 10. Return receipt_hash
  return v_receipt_hash;
end;
$$;

-- Function: get_turnout(election_id)
create or replace function get_turnout(p_election_id uuid)
returns table (eligible_count bigint, voted_count bigint)
language plpgsql
security definer
as $$
declare
  v_org_type text;
  v_jurusan_id uuid;
  v_ukm_id uuid;
begin
  select org_type, jurusan_id, ukm_id 
  into v_org_type, v_jurusan_id, v_ukm_id
  from elections where id = p_election_id;

  voted_count := (select count(*) from votes where election_id = p_election_id);

  if v_org_type = 'BEM' or v_org_type = 'DPM' or v_org_type = 'UKM' then
    eligible_count := (select count(*) from profiles);
  elsif v_org_type = 'HIMA' then
    eligible_count := (select count(*) from profiles where jurusan_id = v_jurusan_id);
  end if;

  return next;
end;
$$;
