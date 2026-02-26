"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, CreditCard, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!email.endsWith("@ikmi.ac.id")) {
      setError("Gunakan email institusi (@ikmi.ac.id)");
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          nim: nim,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Try to insert into profiles. Depending on RLS policies this might need 
    // to be done via a trigger or service role key in a real world app.
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: authData.user.id,
          nim: nim,
          full_name: fullName,
          role: 'student'
        }
      ]);
      
      // We log the error but we might still proceed if there's a trigger handling it
      if (profileError) {
        console.error("Profile insertion error:", profileError);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Registrasi Berhasil!</h2>
          <p className="text-slate-500 mb-8 font-medium">
            Akun Anda telah berhasil didaftarkan. Silakan cek email Anda untuk verifikasi (jika diaktifkan) atau langsung masuk ke aplikasi.
          </p>
          <Link href="/auth/login" className="w-full btn-primary py-4 block text-center rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Kembali ke Beranda</span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Daftar Akun Baru</h1>
            <p className="text-white/60 text-sm mt-1">Gunakan data akademik Anda yang valid</p>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                  placeholder="Nama sesuai KTP/KTM"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nomor Induk Mahasiswa (NIM)</label>
              <div className="relative group">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                  placeholder="Contoh: 4122XXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Institusi</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                  placeholder="nim@ikmi.ac.id"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900"
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-base font-bold rounded-xl text-white bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Buat Akun Mahasiswa"
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Sudah memiliki akun? <Link href="/auth/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-8 text-xs text-slate-400 font-medium px-4">
          Dikelola oleh Komisi Pemilihan Umum Mahasiswa STMIK IKMI Cirebon. Dengan mendaftar, Anda menyetujui aturan tata tertib PEMIRA.
        </p>
      </div>
    </div>
  );
}
