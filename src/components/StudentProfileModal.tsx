import React, { useMemo } from 'react';
import { Student, AttendanceRecord, SchoolIdentity } from '../types';
import {
  X,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Dumbbell,
  Percent,
  Trophy,
  Download,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { showToast } from './Toast';

interface StudentProfileModalProps {
  student: Student | null;
  attendanceRecords: AttendanceRecord[];
  identity: SchoolIdentity;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  attendanceRecords = [],
  identity,
  onClose
}) => {
  if (!student) return null;

  // Filter history for this student
  const studentRecords = useMemo(() => {
    return (attendanceRecords || [])
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, student]);

  const countHadir = (studentRecords || []).filter((r) => r.status === 'Hadir').length;
  const countIjin = (studentRecords || []).filter((r) => r.status === 'Ijin').length;
  const countAlpa = (studentRecords || []).filter((r) => r.status === 'Alpa').length;
  const total = studentRecords.length;
  const percentage = total > 0 ? Math.round((countHadir / total) * 100) : 0;

  // Export this student history to PDF
  const handleExportIndividualPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(identity.schoolName, 105, 20, { align: 'center' });

      doc.setFontSize(11);
      doc.text('KARTU RIWAYAT KEHADIRAN EKSTRAKURIKULER BULUTANGKIS', 105, 27, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`"${identity.slogan}"`, 105, 33, { align: 'center' });

      doc.line(15, 36, 195, 36);

      // Student info block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATA PESERTA:', 15, 44);

      doc.setFont('helvetica', 'normal');
      doc.text(`Nama Lengkap   : ${student.name}`, 15, 50);
      doc.text(`Kelas / Absen    : ${student.grade} / No. ${student.absenNo}`, 15, 56);
      doc.text(`Status Peserta   : ${student.status}`, 15, 62);
      doc.text(`Total Kehadiran : ${countHadir} Hadir, ${countIjin} Ijin, ${countAlpa} Alpa (${percentage}%)`, 15, 68);

      const tableData = studentRecords.map((r, i) => [
        i + 1,
        r.date,
        r.day,
        r.material || '-',
        r.status
      ]);

      autoTable(doc, {
        startY: 74,
        head: [['No', 'Tanggal', 'Hari', 'Materi Latihan', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2.5 }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(9);
      doc.text(`Tejakula, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 140, finalY);
      doc.text('Guru Pembina Bulutangkis,', 140, finalY + 6);
      doc.setFont('helvetica', 'bold');
      doc.text(identity.teacherName, 140, finalY + 26);
      doc.setFont('helvetica', 'normal');
      doc.text(`NIPPPK: ${identity.nipppk}`, 140, finalY + 31);

      doc.save(`Riwayat_Presensi_${student.name.replace(/\s+/g, '_')}.pdf`);
      showToast('Kartu riwayat siswa berhasil diunduh!', 'success');
    } catch (err: any) {
      showToast(`Gagal generate PDF: ${err.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-2xl font-heading shadow-lg shadow-emerald-500/20">
              🏸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white font-heading">
                  {student.name}
                </h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    student.status === 'Aktif'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kelas <strong className="text-emerald-400">{student.grade}</strong> • No. Absen <strong className="text-white">{student.absenNo}</strong> • JK: <strong className="text-cyan-400">{student.gender || 'L'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
            <span className="text-[11px] text-emerald-400 font-bold block">🟢 HADIR</span>
            <p className="text-2xl font-black text-white font-heading mt-0.5">{countHadir}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center">
            <span className="text-[11px] text-amber-400 font-bold block">🟡 IJIN</span>
            <p className="text-2xl font-black text-white font-heading mt-0.5">{countIjin}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center">
            <span className="text-[11px] text-rose-400 font-bold block">🔴 ALPA</span>
            <p className="text-2xl font-black text-white font-heading mt-0.5">{countAlpa}</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
            <span className="text-[11px] text-cyan-400 font-bold block">📊 KEHADIRAN</span>
            <p className="text-2xl font-black text-cyan-300 font-heading mt-0.5">{percentage}%</p>
          </div>
        </div>

        {/* Attendance History Table */}
        <div className="flex-1 overflow-hidden flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Riwayat Presensi Lengkap ({total} Sesi)
            </span>
          </div>

          <div className="overflow-y-auto rounded-2xl border border-slate-800 flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 sticky top-0 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Tanggal & Hari</th>
                  <th className="py-2.5 px-3">Materi Latihan</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {studentRecords.length > 0 ? (
                  studentRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3">
                        <span className="font-bold text-white">{r.date}</span>
                        <span className="text-slate-400 block text-[10px]">{r.day}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {r.material || '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            r.status === 'Hadir'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : r.status === 'Ijin'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Belum ada rekaman absensi untuk peserta ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleExportIndividualPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Kartu Presensi Siswa (PDF)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
