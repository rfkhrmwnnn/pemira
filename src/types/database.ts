export type Profile = {
  id: string;
  nim: string;
  full_name: string;
  jurusan_id: string | null;
  role: 'student' | 'admin' | 'super_admin';
  created_at: string;
};

export type Election = {
  id: string;
  event_id: string;
  title: string;
  org_type: 'BEM' | 'DPM' | 'HIMA' | 'UKM';
  jurusan_id: string | null;
  ukm_id: string | null;
  status: 'draft' | 'active' | 'closed' | 'finalized';
  created_at: string;
};

export type Candidate = {
  id: string;
  election_id: string;
  name: string;
  vision: string;
  mission: string;
  photo_url: string | null;
  order_number: number;
  created_at: string;
};

export type Vote = {
  id: string;
  election_id: string;
  candidate_id: string;
  voter_id: string;
  vote_hash: string;
  receipt_hash: string;
  previous_hash: string;
  voted_at: string;
};
