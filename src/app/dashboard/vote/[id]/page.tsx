"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Vote, CheckCircle2, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Candidate, Election } from "@/types/database";

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: electionId } = use(params);
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if already voted
      const { data: vote } = await supabase
        .from("votes")
        .select("id")
        .eq("election_id", electionId)
        .eq("voter_id", user.id)
        .single();

      if (vote) {
        router.push(`/dashboard/receipt/${electionId}`);
        return;
      }

      // Fetch election
      const { data: electionData } = await supabase
        .from("elections")
        .select("*")
        .eq("id", electionId)
        .eq("status", "active")
        .single();

      if (!electionData) {
        setError("Pemilihan tidak ditemukan atau sudah ditutup.");
        setLoading(false);
        return;
      }
      setElection(electionData);

      // Fetch candidates
      const { data: candidatesData } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId)
        .order("order_number", { ascending: true });

      setCandidates(candidatesData || []);
      setLoading(false);
    };

    fetchData();
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    if (!confirm("Apakah Anda yakin dengan pilihan Anda? Suara yang sudah dikirimkan tidak dapat diubah (Immutable).")) {
      return;
    }

    setVoting(true);
    setError(null);

    const { data: receiptHash, error: voteError } = await supabase.rpc("secure_vote", {
      p_election_id: electionId,
      p_candidate_id: selectedCandidate,
    });

    if (voteError) {
      setError(voteError.message);
      setVoting(false);
    } else {
      router.push(`/dashboard/receipt/${electionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/dashboard" className="btn-primary">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold uppercase tracking-widest text-[10px]">Kembali</span>
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">Bilik Suara Digital</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{election?.title}</p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {candidates.map((candidate) => (
              <div 
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`group relative institutional-card cursor-pointer overflow-hidden ring-4 transition-all duration-300 ${
                  selectedCandidate === candidate.id 
                    ? "ring-primary bg-primary/[0.02]" 
                    : "ring-transparent hover:ring-slate-200"
                }`}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-400">
                      {candidate.order_number}
                    </div>
                    {selectedCandidate === candidate.id && (
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{candidate.name}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Visi</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{candidate.vision}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Misi</h4>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{candidate.mission}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-8 bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 transform translate-y-0 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h4 className="text-sm font-bold text-slate-900">Keamanan Kriptografi Aktif</h4>
                <p className="text-[10px] text-slate-500 font-medium">Suara Anda akan di-hash menggunakan SHA-256 secara langsung.</p>
              </div>
            </div>
            
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || voting}
              className={`w-full sm:w-auto px-12 py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-3 ${
                selectedCandidate 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {voting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim Suara...
                </>
              ) : (
                <>
                  <Vote className="w-6 h-6" />
                  Kirim Surat Suara
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
