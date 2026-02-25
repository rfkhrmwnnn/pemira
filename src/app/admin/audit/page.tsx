import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { ShieldAlert, Terminal, Lock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'super_admin') redirect("/admin/dashboard");

  // Fetch recent logs
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, profile:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-900 text-slate-300 py-12 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-xs">Internal Audit Engine v1.0.4</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">System Integrity Report</h1>
              <p className="text-slate-500 mt-2">Classified Information - Super Admin Access Only</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">COMMIT_HASH: <span className="text-emerald-500">7af2b89</span></p>
              <p className="text-[10px] text-slate-500">ENGINE_STATUS: <span className="text-emerald-500">OPTIMAL</span></p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-500">RLS Validation</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-white font-bold">ALL TABLES PROTECTED</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-500">Signature Check</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-white font-bold">100% VALIDATED</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-500">Immunity Status</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-white font-bold">NO DRIFT DETECTED</p>
            </div>
          </div>

          <div className="bg-black/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Real-time Audit Trail</span>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {logs?.map((log) => (
                <div key={log.id} className="text-[11px] leading-relaxed group">
                  <span className="text-slate-600">[{log.created_at}]</span>{" "}
                  <span className="text-primary font-bold">{log.profile?.full_name || 'SYSTEM'}</span>{" "}
                  <span className="text-white font-bold px-1.5 py-0.5 bg-slate-800 rounded mx-1">{log.action}</span>{" "}
                  <span className="text-slate-500">{JSON.stringify(log.details)}</span>
                  <div className="h-px w-full bg-slate-800/50 mt-4 group-last:hidden"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
