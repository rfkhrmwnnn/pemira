"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, ShieldCheck, Copy, Download, Share2, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Vote, Election } from "@/types/database";

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: electionId } = use(params);
  const [election, setElection] = useState<Election | null>(null);
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: electionData } = await supabase
        .from("elections")
        .select("*")
        .eq("id", electionId)
        .single();

      const { data: voteData } = await supabase
        .from("votes")
        .select("*")
        .eq("election_id", electionId)
        .eq("voter_id", user.id)
        .single();

      if (!voteData) {
        router.push(`/dashboard/vote/${electionId}`);
        return;
      }

      setElection(electionData);
      setVote(voteData);
      setLoading(false);
    };

    fetchData();
  }, [electionId]);

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold uppercase tracking-widest text-[10px]">Kembali ke Dashboard</span>
          </Link>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="bg-primary p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-40 h-40" />
              </div>
              
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-black tracking-tight mb-2 relative z-10">Bukti Suara Berhasil</h1>
              <p className="text-white/70 font-medium relative z-10">Suara Anda telah tercatat secara permanen di ledger PEMIRA.</p>
            </div>

            <div className="p-10 space-y-10">
              {/* Election Info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Nama Pemilihan</h4>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{election?.title}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Waktu Voting</h4>
                  <p className="text-sm font-bold text-slate-500">
                    {new Date(vote?.voted_at || "").toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {/* Hashes */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Receipt Hash (Public)</h4>
                    <button 
                      onClick={() => copyHash(vote?.receipt_hash || "")}
                      className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      {copied ? "Berhasil Disalin" : <><Copy className="w-3 h-3" /> Salin Hash</>}
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] break-all leading-relaxed text-slate-600 shadow-inner">
                    {vote?.receipt_hash}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vote Chain Hash (Encrypted)</h4>
                  </div>
                  <div className="p-4 bg-slate-100/50 border border-slate-200 rounded-xl font-mono text-[11px] break-all leading-relaxed text-slate-400">
                    {vote?.vote_hash}
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-emerald-700 uppercase leading-none mb-1">Immutable</h5>
                    <p className="text-[9px] font-medium text-emerald-600/70">Anti-Manipulasi</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-primary uppercase leading-none mb-1">Chained</h5>
                    <p className="text-[9px] font-medium text-primary/40">SHA-256 Chain</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Cetak Bukti Suara PDF
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-start gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <Share2 className="w-10 h-10 text-primary shrink-0 opacity-50" />
            <p className="text-xs text-slate-500 leading-relaxed italic">
              "Kirimkan Receipt Hash ini ke panitia pemira jika terjadi perselisihan data. Hash ini adalah bukti sah secara kriptografi bahwa suara Anda telah masuk ke dalam sistem."
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
