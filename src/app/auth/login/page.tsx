"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanNim = nim.trim();
    if (!cleanNim) {
      setError("NIM tidak boleh kosong");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: `${cleanNim}@student.ikmi.ac.id`,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Kembali ke Beranda</span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Login</h1>
            <p className="text-white/60 text-sm mt-1">Gunakan akun Anda untuk masuk</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Identitas Mahasiswa</label>
              <div className="relative group">
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full pl-5 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                  placeholder="Masukkan NIM Anda"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Belum memiliki akun? <Link href="/auth/register" className="text-primary font-bold hover:underline">Daftar Sekarang</Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          Dikelola oleh Komisi Pemilihan Umum Mahasiswa STMIK IKMI Cirebon
        </p>
      </div>
    </div>
  );
}
