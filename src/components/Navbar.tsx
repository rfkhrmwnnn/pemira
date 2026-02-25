"use client";

import Link from "next/link";
import { Vote, ShieldCheck, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              I
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-bold leading-none tracking-tight">PEMIRA DIGITAL</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">STMIK IKMI 2026</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/verify" className="text-slate-600 hover:text-primary font-medium flex items-center gap-1.5 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              Verifikasi
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900 leading-none">{user.user_metadata.full_name || user.email}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Mahasiswa</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary py-2 px-5 text-sm">
                Login Mahasiswa
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
