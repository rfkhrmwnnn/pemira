import Navbar from "@/components/Navbar";
import { Vote, ShieldCheck, Lock, CheckCircle2, ChevronRight, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Sistem Pemilihan Digital Terverifikasi
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                Masa Depan <span className="text-primary italic">Demokrasi</span> Kampus IKMI.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-10">
                Wujudkan kepemimpinan mahasiswa yang berintegritas melalui sistem voting digital berbasis kriptografi Merkle-Tree. Aman, transparan, dan tidak dapat dimanipulasi.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/login" className="btn-primary w-full sm:w-auto px-8 py-4 text-base">
                  Mulai Voting Sekarang
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/verify" className="flex items-center gap-2 text-slate-600 font-semibold hover:text-primary transition-colors px-6 py-4">
                  <ShieldCheck className="w-5 h-5" />
                  Verifikasi Hasil
                </Link>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
          </div>
        </section>

        {/* Stats / Features Grid */}
        <section className="py-20 bg-muted/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="institutional-card p-8 bg-white">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Immutable Vote</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Setiap suara Anda diamankan dengan hash chain SHA-256 yang mustahil untuk diubah setelah dikirimkan.
                </p>
              </div>
              <div className="institutional-card p-8 bg-white">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Governance Proof</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Finalisasi hasil memerlukan persetujuan &gt;66% dari admin independen melalui tanda tangan digital Ed25519.
                </p>
              </div>
              <div className="institutional-card p-8 bg-white">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Public Verifiable</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Siapa pun dapat memverifikasi integritas surat suara menggunakan Merkle Root yang dipublikasikan secara terbuka.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 opacity-70 grayscale">
             <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">STMIK IKMI Cirebon</span>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            &copy; 2026 PEMIRA DIGITAL IKMI. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-slate-400 hover:text-primary transition-colors">Syarat & Ketentuan</Link>
            <Link href="/help" className="text-xs text-slate-400 hover:text-primary transition-colors">Bantuan</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
