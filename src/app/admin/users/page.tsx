"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Users, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processExcel = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Map headers (assume 'nim' and 'full_name' exist in Excel col names)
      const mappedData = json.map((row: any) => ({
        nim: row.nim?.toString() || row.NIM?.toString() || row.Nim?.toString(),
        full_name: row.full_name || row.nama_lengkap || row['Nama Lengkap'] || row.nama || row.Nama,
      })).filter((r: any) => r.nim && r.full_name);

      if (mappedData.length === 0) {
        throw new Error("Data tidak ditemukan atau format kolom salah. Pastikan ada kolom 'nim' dan 'full_name' atau nama/Nama Lengkap.");
      }

      const res = await fetch("/api/admin/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: mappedData }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Terjadi kesalahan saat memproses data");
      }

      setResults(responseData.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold uppercase tracking-widest text-[10px]">Kembali ke Dashboard Admin</span>
          </Link>

          <header className="mb-12">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Mahasiswa</h1>
            <p className="text-slate-500 font-medium">Import data akun mahasiswa peserta pemilu.</p>
          </header>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              Import Data Excel
            </h2>

            <p className="text-sm text-slate-500 mb-6">
              Unggah file Excel (.xlsx or .xls) yang berisi kolom untuk <b>NIM</b> dan <b>Nama Lengkap</b>. 
              Sistem akan otomatis membuat akun untuk setiap baris, tipe akses &lt;nim&gt;@student.ikmi.ac.id dengan password default NIM.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center transition-colors hover:bg-slate-50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/5 file:text-primary
                  hover:file:bg-primary/10 transition-all mx-auto max-w-xs"
              />
              <p className="text-xs text-slate-400 mt-4">Hanya file Excel</p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {results && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm rounded-xl">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3>Hasil Import</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Berhasil diimport: <strong className="text-emerald-900">{results.success}</strong> mahasiswa</li>
                  <li>Gagal/Sudah ada: <strong className="text-red-600">{results.failed}</strong> baris</li>
                </ul>
              </div>
            )}

            <button
              onClick={processExcel}
              disabled={!file || loading}
              className={`w-full mt-6 py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all ${
                file && !loading ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
              ) : (
                <><Users className="w-5 h-5" /> Import Akun</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
