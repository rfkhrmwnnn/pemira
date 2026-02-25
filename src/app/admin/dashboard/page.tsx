import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { Users, Vote, CheckSquare, ShieldAlert, BarChart, Settings, Plus, Lock } from "lucide-react";
import Link from "next/link";
import { Election } from "@/types/database";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    redirect("/dashboard");
  }

  // Fetch all elections
  const { data: elections } = await supabase
    .from("elections")
    .select("*, event:pemira_events(title)")
    .order("created_at", { ascending: false });

  // Stats
  const totalElections = elections?.length || 0;
  const activeElections = elections?.filter(e => e.status === 'active').length || 0;
  const closedElections = elections?.filter(e => e.status === 'closed').length || 0;

  return (
    <>
      <Navbar />
      <div className="flex-1 flex bg-slate-50/30">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-4">Menu Utama</p>
            <nav className="space-y-1">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold text-sm">
                <BarChart className="w-5 h-5" />
                Overview
              </Link>
              <Link href="/admin/elections" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">
                <Vote className="w-5 h-5" />
                Manajemen Pilihan
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">
                <Users className="w-5 h-5" />
                Data Mahasiswa
              </Link>
            </nav>
          </div>
          
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-4">Governance</p>
            <nav className="space-y-1">
              <Link href="/admin/approvals" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">
                <CheckSquare className="w-5 h-5" />
                Persetujuan (66%)
              </Link>
              <Link href="/admin/audit" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">
                <ShieldAlert className="w-5 h-5" />
                Audit Trail
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Console Administrasi</h1>
                <p className="text-slate-500 font-medium">Panel kontrol pusat PEMIRA IKMI 2025</p>
              </div>
              <button className="btn-primary">
                <Plus className="w-5 h-5" />
                Buat Pemilihan Baru
              </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pilihan</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-900">{totalElections}</span>
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                    <Vote className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aktif Sekarang</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-emerald-600">{activeElections}</span>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Menunggu Finalisasi</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-amber-500">{closedElections}</span>
                  <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Online</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-900">4</span>
                  <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Elections Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Daftar Pemilihan Terkini</h3>
                <Link href="/admin/elections" className="text-primary text-xs font-bold hover:underline">Lihat Semua</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Pemilihan</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partisipasi</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {elections?.map((election) => (
                      <tr key={election.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 text-sm leading-tight">{election.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{election.event?.title}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-tighter">
                            {election.org_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              election.status === 'active' ? 'bg-emerald-500' : 
                              election.status === 'closed' ? 'bg-amber-500' : 'bg-slate-300'
                            }`}></div>
                            <span className="text-xs font-bold text-slate-600 capitalize">{election.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-[45%]"></div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tighter">45% (120/300)</p>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/elections/${election.id}`} className="text-[10px] font-black text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">
                            KELOLA
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
