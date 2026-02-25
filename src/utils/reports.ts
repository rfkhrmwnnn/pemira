import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

export async function generateCertifiedReport(election: any, results: any[], snapshot: any) {
  const doc = new jsPDF() as any;
  const year = new Date().getFullYear();
  const docNumber = `PEMIRA-IKMI/${year}/FINAL/00${election.id.substring(0,1)}`;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN HASIL PEMILIHAN BERSERTIFIKAT", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(docNumber, 105, 28, { align: "center" });
  
  doc.line(20, 35, 190, 35);

  // Body
  doc.setFontSize(12);
  doc.text("Informasi Pemilihan:", 20, 45);
  doc.setFontSize(10);
  doc.text(`Judul: ${election.title}`, 20, 52);
  doc.text(`Tipe Organisasi: ${election.org_type}`, 20, 58);
  doc.text(`Waktu Finalisasi: ${format(new Date(snapshot.finalized_at), 'PPPpppp')}`, 20, 64);

  // Table
  doc.autoTable({
    startY: 75,
    head: [['Kandidat', 'Total Suara', 'Persentase']],
    body: results.map(r => [r.name, r.vote_count, `${((r.vote_count / snapshot.total_votes) * 100).toFixed(2)}%`]),
    theme: 'striped',
    headStyles: { fillColor: [26, 54, 93] }
  });

  // Cryptography Section
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "bold");
  doc.text("KOMITMEN KRIPTOGRAFI:", 20, finalY);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text(`MERKLE ROOT: ${snapshot.merkle_root}`, 20, finalY + 8);
  doc.text(`DIGITAL SIGNATURE: ${snapshot.signature}`, 20, finalY + 14);
  doc.text(`PUBLIC KEY: ${process.env.NEXT_PUBLIC_PUBLIC_KEY || 'N/A'}`, 20, finalY + 20);

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Dokumen ini dihasilkan secara otomatis oleh sistem PEMIRA DIGITAL IKMI 2025.", 105, 280, { align: "center" });
  doc.text("Keaslian dokumen dapat diverifikasi melalui halaman /verify dengan menggunakan Merkle Root di atas.", 105, 285, { align: "center" });

  doc.save(`${docNumber}.pdf`);
}
