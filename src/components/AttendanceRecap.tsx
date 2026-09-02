import React, { useState, useMemo } from 'react';
import {
  Student,
  AttendanceRecord,
  SchoolIdentity,
  CLASS_OPTIONS,
  AttendanceSummaryRow
} from '../types';
import {
  exportAttendanceRecapExcel,
  exportAttendanceRecapPdf
} from '../utils/exportUtils';
import {
  FileSpreadsheet,
  FileDown,
  Calendar,
  Filter,
  Trophy,
  Award,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Users,
  ChevronDown,
  Printer
} from 'lucide-react';
import { showToast } from './Toast';

interface AttendanceRecapProps {
  students?: Student[];
  attendanceRecords?: AttendanceRecord[];
  identity: SchoolIdentity;
  onSelectStudent: (student: Student) => void;
}

export const AttendanceRecap: React.FC<AttendanceRecapProps> = ({
  students = [],
  attendanceRecords = [],
  identity,
  onSelectStudent
}) => {
  const [filterType, setFilterType] = useState<'all' | 'month' | 'semester' | 'custom'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedSemester, setSelectedSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter records by time period
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (filterType === 'month') {
        return rec.date.startsWith(selectedMonth);
      }
      if (filterType === 'semester') {
        const monthNum = parseInt(rec.date.split('-')[1], 10);
        if (selectedSemester === 'ganjil') {
          // Ganjil: Jul - Des (7 - 12)
          return monthNum >= 7 && monthNum <= 12;
        } else {
          // Genap: Jan - Jun (1 - 6)
          return monthNum >= 1 && monthNum <= 6;
        }
      }
      if (filterType === 'custom') {
        if (startDate && rec.date < startDate) return false;
        if (endDate && rec.date > endDate) return false;
        return true;
      }
      return true;
    });
  }, [attendanceRecords, filterType, selectedMonth, selectedSemester, startDate, endDate]);

  // Unique session dates count
  const uniqueDates = useMemo(() => {
    const dates = new Set(filteredRecords.map((r) => r.date));
    return Array.from(dates);
  }, [filteredRecords]);

  // Aggregate student summaries
  const recapData: AttendanceSummaryRow[] = useMemo(() => {
    return students
      .filter((s) => !selectedGrade || s.grade === selectedGrade)
      .map((student) => {
        const studentRecs = filteredRecords.filter((r) => r.studentId === student.id);
        const hadir = studentRecs.filter((r) => r.status === 'Hadir').length;
        const ijin = studentRecs.filter((r) => r.status === 'Ijin').length;
        const alpa = studentRecs.filter((r) => r.status === 'Alpa').length;
        const total = hadir + ijin + alpa;

        const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

        let predicate = 'Cukup';
        if (percentage >= 90) predicate = 'Sangat Baik';
        else if (percentage >= 75) predicate = 'Baik';
        else if (percentage >= 60) predicate = 'Cukup';
        else predicate = 'Kurang';

        return {
          student,
          hadir,
          ijin,
          alpa,
          total,
          percentage,
          predicate
        };
      })
      .filter((row) => {
        const match =
          row.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.student.absenNo.toString().includes(searchTerm);
        return match;
      });
  }, [students, filteredRecords, selectedGrade, searchTerm]);

  // Top 3 Ranking
  const topStudents = useMemo(() => {
    return [...recapData]
      .filter((r) => r.total > 0)
      .sort((a, b) => b.percentage - a.percentage || b.hadir - a.hadir)
      .slice(0, 3);
  }, [recapData]);

  // Handle Excel Export
  const handleExportExcel = () => {
    let periodText = 'Semua Periode';
    if (filterType === 'month') periodText = `Bulan ${selectedMonth}`;
    if (filterType === 'semester') periodText = `Semester ${selectedSemester === 'ganjil' ? 'Ganjil' : 'Genap'}`;
    if (filterType === 'custom') periodText = `${startDate || 'Awal'} s/d ${endDate || 'Akhir'}`;

    exportAttendanceRecapExcel(recapData, identity, periodText);
    showToast('Rekap Excel berhasil diunduh! 📊', 'success');
  };

  // Handle PDF Export
  const handleExportPdf = () => {
    let periodText = 'Semua Periode';
    if (filterType === 'month') periodText = `Bulan ${selectedMonth}`;
    if (filterType === 'semester') periodText = `Semester ${selectedSemester === 'ganjil' ? 'Ganjil' : 'Genap'}`;
    if (filterType === 'custom') periodText = `${startDate || 'Awal'} s/d ${endDate || 'Akhir'}`;

    exportAttendanceRecapPdf(recapData, identity, periodText);
    showToast('Laporan PDF Resmi berhasil digenerate! 📄', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
              📊 REKAPITULASI ABSENSI BULUTANGKIS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Total Sesi Tercatat: <strong className="text-emerald-400 font-bold">{uniqueDates.length} Pertemuan</strong> • Guru Pembina: <span className="text-slate-200">{identity.teacherName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>📥 DOWNLOAD EXCEL</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>📄 DOWNLOAD PDF RESMI</span>
          </button>
        </div>
      </div>

      {/* Top 3 Ranking Card (Section 16: Ranking Kehadiran) */}
      {topStudents.length > 0 && (
        <div className="sports-glass p-5 rounded-3xl border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>🏆 RANKING KEHADIRAN TERBAIK (DISIPLIN TERTINGGI)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topStudents.map((item, idx) => (
              <div
                key={item.student.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center gap-3 relative overflow-hidden"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base font-heading shrink-0 ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-950'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  #{idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-xs truncate">
                    {item.student.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Kelas {item.student.grade} • Hadir {item.hadir}/{item.total} Sesi
                  </p>
                </div>
                <span className="text-sm font-black text-emerald-400 font-heading">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Period Box (Section 16) */}
      <div className="sports-glass p-4 rounded-3xl border-emerald-500/20 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-300 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter Rentang Waktu:
          </span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('month')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'month' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setFilterType('semester')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'semester' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semester
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'custom' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kustom
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {filterType === 'month' && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Pilih Bulan</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          )}

          {filterType === 'semester' && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Pilih Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="ganjil">Semester Ganjil (Juli - Desember)</option>
                <option value="genap">Semester Genap (Januari - Juni)</option>
              </select>
            </div>
          )}

          {filterType === 'custom' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Filter Kelas</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white cursor-pointer"
            >
              <option value="">Semua Kelas</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Cari Nama Siswa</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recap Table (Section 16 Table Format) */}
      <div className="sports-glass rounded-3xl border-emerald-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/95 border-b border-slate-800 text-slate-300 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Peserta</th>
                <th className="py-3.5 px-4 text-center">Kelas</th>
                <th className="py-3.5 px-3 text-center text-emerald-400 font-extrabold">Hadir</th>
                <th className="py-3.5 px-3 text-center text-amber-400 font-extrabold">Ijin</th>
                <th className="py-3.5 px-3 text-center text-rose-400 font-extrabold">Alpa</th>
                <th className="py-3.5 px-3 text-center text-slate-300">Total Sesi</th>
                <th className="py-3.5 px-4 text-center text-cyan-400 font-extrabold">% Hadir</th>
                <th className="py-3.5 px-4 text-center">Keterangan / Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recapData.map((row, idx) => (
                <tr
                  key={row.student.id}
                  className="hover:bg-emerald-950/20 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <button
                      onClick={() => onSelectStudent(row.student)}
                      className="hover:text-emerald-400 transition-colors text-left font-bold"
                    >
                      {row.student.name}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-emerald-300">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {row.student.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                    {row.hadir}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400">
                    {row.ijin}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-400">
                    {row.alpa}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                    {row.total}
                  </td>
                  <td className="py-3.5 px-4 text-center font-heading font-black text-cyan-400 text-sm">
                    {row.percentage}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        row.predicate === 'Sangat Baik'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : row.predicate === 'Baik'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : row.predicate === 'Cukup'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {row.predicate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
