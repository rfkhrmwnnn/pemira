"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CheckSquare, AlertTriangle, ShieldCheck, Loader2, ChevronRight, Lock, Unlock } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AdminApprovalsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("elections")
      .select("*, approvals:election_approvals(*)")
      .eq("status", "closed");
    
    setElections(data || []);
    setLoading(false);
  };

  const handleApprove = async (electionId: string) => {
    setProcessing(electionId);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("election_approvals")
      .insert({ election_id: electionId, admin_id: user?.id });

    if (error) {
      alert(error.message);
    } else {
      await fetchElections();
    }
    setProcessing(null);
  };

  const handleFinalize = async (electionId: string) => {
    if (!confirm("Konfirmasi Finalisasi: Aksi ini bersifat permanen. Merkle Root akan dikunci dan ditandatangani secara digital. Anda yakin?")) return;
    
    setProcessing(electionId);
    
    // In a real system, this would be a secure server-side action
    // We'll simulate the Merkle root calculation and signing
    const { data: votes } = await supabase
      .from("votes")
      .select("vote_hash")
      .eq("election_id", electionId);

    // Build Merkle Root (Simplified for demonstration)
    const merkleRoot = "ROOT_" + Math.random().toString(36).substring(7);
    const signature = "SIG_ED25519_" + Math.random().toString(36).substring(7);

    // Update election status and insert snapshot
    const { error } = await supabase
      .from("elections")
      .update({ status: 'finalized' })
      .eq("id", electionId);

    if (!error) {
      await supabase.from("election_snapshots").insert({
        election_id: electionId,
        merkle_root: merkleRoot,
        signature: signature
      });
      alert("Pemilihan berhasil difinalisasi!");
      await fetchElections();
    }

    setProcessing(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Persetujuan Tata Kelola</h1>
            <p className="text-slate-500 font-medium">Finalisasi hasil voting memerlukan konsensus minimal 66% admin.</p>
          </header>

          <div className="space-y-6">
            {elections.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Tidak ada pemilihan yang siap difinalisasi.</p>
                <p className="text-xs">Hanya pemilihan dengan status 'closed' yang muncul di sini.</p>
              </div>
            ) : (
              elections.map((election) => {
                const adminCount = 3; // Static for demo, should be dynamic
                const approvalCount = election.approvals?.length || 0;
                const threshold = Math.ceil(adminCount * 0.66);
                const isReady = approvalCount >= threshold;

                return (
                  <div key={election.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded uppercase tracking-widest border border-amber-100">Menunggu Finalisasi</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{election.id.substring(0,8)}</span>
                           </div>
                           <h2 className="text-xl font-black text-slate-900 leading-tight">{election.title}</h2>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl min-w-[160px]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konsensus Admin</p>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900">{approvalCount} / {adminCount}</span>
                            <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'}`}></div>
                          </div>
                          <p className={`text-[10px] font-bold ${isReady ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isReady ? "Ambang batas tercapai" : `Butuh ${threshold - approvalCount} lagi`}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                          onClick={() => handleApprove(election.id)}
                          disabled={processing === election.id || election.approvals?.some((a: any) => a.admin_id === 'simulated-user-id')}
                          className="w-full btn-primary py-3 text-sm flex-1"
                        >
                          {processing === election.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                          Berikan Persetujuan
                        </button>
                        
                        <button
                          onClick={() => handleFinalize(election.id)}
                          disabled={!isReady || processing === election.id}
                          className={`w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1 ${
                            isReady 
                              ? "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200" 
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {processing === election.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          Finalisasi & Sign Merkle Root
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </>
  );
}
