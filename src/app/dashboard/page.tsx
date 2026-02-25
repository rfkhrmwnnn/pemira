import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { Vote, ChevronRight, CheckCircle2, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { Election } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, jurusan:jurusan(name)")
    .eq("id", user.id)
    .single();

  // Get active elections
  let electionsQuery = supabase
    .from("elections")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { data: activeElections } = await electionsQuery;

  // Get user votes to check if already voted
  const { data: userVotes } = await supabase
    .from("votes")
    .select("election_id")
    .eq("voter_id", user.id);

  const votedElectionIds = new Set(userVotes?.map(v => v.election_id) || []);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Pemilih</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Portal Voting PEMIRA IKMI 2026</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Status Eligible</p>
                <p className="text-sm font-bold text-slate-900">{profile?.jurusan?.name || "Program Studi Tidak Terdaftar"}</p>
              </div>
            </div>
          </div>

          {!activeElections || activeElections.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Vote className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tidak Ada Pemilihan Aktif</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Saat ini belum ada surat suara yang aktif. Silakan kembali lagi nanti sesuai jadwal yang ditentukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeElections.map((election: Election) => {
                const hasVoted = votedElectionIds.has(election.id);
                
                return (
                  <div key={election.id} className={`institutional-card overflow-hidden flex flex-col ${hasVoted ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                          {election.org_type}
                        </span>
                        {hasVoted ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah Memilih
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-primary text-xs font-bold animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Belum Memilih
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                        {election.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        Pilih pemimpin terbaik untuk masa depan {election.org_type} IKMI Cirebon.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                      {hasVoted ? (
                        <Link 
                          href={`/dashboard/receipt/${election.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-white/50 transition-colors"
                        >
                          Lihat Bukti Suara
                        </Link>
                      ) : (
                        <Link 
                          href={`/dashboard/vote/${election.id}`}
                          className="flex items-center justify-center gap-2 w-full btn-primary py-2.5 px-4 text-sm"
                        >
                          Masuk Bilik Suara
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
