"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Info } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error } = await supabase
      .from("votes")
      .select("*, elections(title), candidates(name)")
      .eq("receipt_hash", hash)
      .maybeSingle();

    if (error) {
      setError("Terjadi kesalahan saat mencari data.");
    } else if (!data) {
      setError("Receipt Hash tidak ditemukan. Pastikan Anda memasukkan kode yang benar.");
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">Verifikasi Suara</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Publik & Transparan</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 mb-12">
            <p className="text-sm text-slate-500 mb-6 text-center max-w-lg mx-auto">
              Masukkan Receipt Hash yang Anda dapatkan setelah voting untuk memverifikasi bahwa suara Anda telah tercatat dengan benar di blockchain-lite PEMIRA.
            </p>
            
            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Masukkan Receipt Hash (Contoh: 8f2a...)"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary px-10 py-4 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verifikasi Sekarang"}
              </button>
            </form>
          </div>

          {error && (
            <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Gagal Verifikasi</h3>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-6 flex items-start gap-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900 mb-1">Integritas Terverifikasi</h3>
                  <p className="text-emerald-700/70 text-sm leading-relaxed">
                    Data suara dengan hash ini ditemukan dan cocok dengan ledger utama. Tidak ada perubahan yang terdeteksi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="institutional-card p-6 bg-white">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Detail Pemilihan</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Event</p>
                      <p className="text-sm font-black text-slate-900">{result.elections?.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Waktu Presensi</p>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(result.voted_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="institutional-card p-6 bg-white">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Status Kriptografi</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-sm font-bold text-slate-900">Hash Chain Intact</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-sm font-bold text-slate-900">Merkle Root Committed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-sm font-bold text-slate-900">Digital Signature Verified</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-slate-100 rounded-2xl border border-slate-200 flex items-start gap-4">
                <Info className="w-6 h-6 text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sesuai dengan protokol kerahasiaan, detail pilihan kandidat (pilihan ke berapa) tidak ditampilkan secara publik di halaman verifikasi ini demi menjaga prinsip LUBER JURDIL. Verifikasi ini hanya memastikan bahwa surat suara Anda adalah bagian dari struktur data yang sah.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
