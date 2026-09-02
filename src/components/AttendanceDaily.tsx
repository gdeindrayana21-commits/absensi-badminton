import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  BADMINTON_MATERIALS,
  CLASS_OPTIONS,
  SchoolIdentity
} from '../types';
import {
  setStudentAttendance,
  saveBulkAttendance,
  getAttendanceRecords
} from '../utils/storage';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Zap,
  Save,
  Check,
  Search,
  Users,
  Percent,
  Sparkles,
  Info,
  ChevronDown,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { showToast } from './Toast';

interface AttendanceDailyProps {
  students?: Student[];
  attendanceRecords?: AttendanceRecord[];
  identity: SchoolIdentity;
  onNavigateToQuick: () => void;
}

export const AttendanceDaily: React.FC<AttendanceDailyProps> = ({
  students = [],
  attendanceRecords = [],
  identity,
  onNavigateToQuick
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('09:00');
  const [material, setMaterial] = useState<string>(BADMINTON_MATERIALS[0]);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Attendance status map for the selected date { [studentId]: AttendanceStatus }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  
  // Autosave status indicator
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Summary Success Modal (Section 11)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<{
    total: number;
    hadir: number;
    ijin: number;
    alpa: number;
    percentage: number;
  }>({ total: 0, hadir: 0, ijin: 0, alpa: 0, percentage: 0 });

  // Update day name when selectedDate changes
  useEffect(() => {
    try {
      const dateObj = new Date(selectedDate);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(dateObj);
      setSelectedDay(dayName);
    } catch {
      setSelectedDay('Sabtu');
    }
  }, [selectedDate]);

  // Load existing attendance for selectedDate or default all to 'Hadir'
  useEffect(() => {
    const existing = attendanceRecords.filter((r) => r.date === selectedDate);
    const map: Record<string, AttendanceStatus> = {};

    if (existing.length > 0) {
      existing.forEach((rec) => {
        map[rec.studentId] = rec.status;
      });
      // Load material & time from existing if available
      if (existing[0].material) setMaterial(existing[0].material);
      if (existing[0].startTime) setStartTime(existing[0].startTime);
      if (existing[0].endTime) setEndTime(existing[0].endTime);
      if (existing[0].notes) setSessionNotes(existing[0].notes);
    } else {
      // Default to Hadir for active students
      students.forEach((s) => {
        if (s.status === 'Aktif') {
          map[s.id] = 'Hadir';
        }
      });
    }

    setAttendanceMap(map);
  }, [selectedDate, attendanceRecords, students]);

  // Real-time Autosave Single Student Status (Section 10)
  const handleStatusChange = (student: Student, status: AttendanceStatus) => {
    setIsSaving(true);
    setAttendanceMap((prev) => ({ ...prev, [student.id]: status }));

    const res = setStudentAttendance(
      selectedDate,
      selectedDay,
      student,
      status,
      startTime,
      endTime,
      material,
      sessionNotes
    );

    setTimeout(() => {
      setIsSaving(false);
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(now);
      if (res.success) {
        showToast(`Absensi ${student.name} tersimpan: ${status}`, 'success');
      } else {
        showToast('Gagal menyimpan data. Silakan coba lagi.', 'error');
      }
    }, 150);
  };

  // Bulk Mark All as Hadir
  const handleMarkAllHadir = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      if (s.status === 'Aktif') {
        newMap[s.id] = 'Hadir';
        setStudentAttendance(selectedDate, selectedDay, s, 'Hadir', startTime, endTime, material, sessionNotes);
      }
    });
    setAttendanceMap(newMap);
    showToast('Semua peserta aktif ditandai Hadir! 🟢', 'success');
  };

  // Save Attendance & Show Formal Recap Modal (Section 11)
  const handleManualSave = () => {
    const res = saveBulkAttendance(
      selectedDate,
      selectedDay,
      attendanceMap,
      startTime,
      endTime,
      material,
      sessionNotes
    );

    setSummaryData(res);
    setIsSummaryModalOpen(true);

    // Trigger celebratory confetti if high attendance
    if (res.percentage >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    showToast('Absensi berhasil disimpan dan tersinkronisasi!', 'success');
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.absenNo.toString().includes(searchTerm);
    const matchGrade = !filterGrade || s.grade === filterGrade;
    return matchSearch && matchGrade;
  });

  // Calculate live counters
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const countHadir = activeStudents.filter((s) => (attendanceMap[s.id] || 'Alpa') === 'Hadir').length;
  const countIjin = activeStudents.filter((s) => attendanceMap[s.id] === 'Ijin').length;
  const countAlpa = activeStudents.filter((s) => attendanceMap[s.id] === 'Alpa').length;
  const livePct = activeStudents.length > 0 ? ((countHadir / activeStudents.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="sports-glass p-5 sm:p-6 rounded-3xl border-emerald-500/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
                📋 ABSENSI HARIAN EKSTRAKURIKULER
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Kegiatan: <strong className="text-emerald-400">Ekstrakurikuler Bulutangkis / Badminton</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onNavigateToQuick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-emerald-400" />
              <span>⚡ MODE ABSENSI CEPAT (HP)</span>
            </button>

            <button
              onClick={handleMarkAllHadir}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Tandai Semua Hadir</span>
            </button>

            <button
              onClick={handleManualSave}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>💾 SIMPAN ABSENSI</span>
            </button>
          </div>
        </div>

        {/* Form Session Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block text-slate-300 font-bold uppercase mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal Sesi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-emerald-400 mt-0.5 block font-semibold">
              Hari: {selectedDay}
            </span>
          </div>

          {/* Time Start / End */}
          <div>
            <label className="block text-slate-300 font-bold uppercase mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Jam Latihan (WITA)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Training Material (Section 13: Materi Latihan) */}
          <div className="lg:col-span-2">
            <label className="block text-slate-300 font-bold uppercase mb-1 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> 🏸 Materi Latihan Sesi Ini
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {BADMINTON_MATERIALS.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Attendance Counter Ribbon (Autosave indicator) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              🟢 Hadir: {countHadir}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              🟡 Ijin: {countIjin}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              🔴 Alpa: {countAlpa}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 font-bold text-cyan-400">
              📊 {livePct}% Hadir
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            {isSaving ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                <RotateCcw className="w-3 h-3 animate-spin" /> Menyimpan real-time...
              </span>
            ) : lastSavedTime ? (
              <span className="text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Autosave aktif • {lastSavedTime}
              </span>
            ) : (
              <span>Autosave Real-time Siap</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 Cari nama siswa, kelas, no absen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Semua Kelas</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Presensi (Section 8: Absensi Harian Table) */}
      <div className="sports-glass rounded-3xl border-emerald-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-300 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Peserta</th>
                <th className="py-3.5 px-4 text-center">Kelas</th>
                <th className="py-3.5 px-4 text-center">Absen</th>
                <th className="py-3.5 px-6 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((student, idx) => {
                const currentStatus = attendanceMap[student.id] || 'Alpa';

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-emerald-950/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.status === 'Tidak Aktif' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-medium">
                        {student.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {student.absenNo}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {/* Big 3-Status Buttons (Section 8) */}
                      <div className="inline-flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 gap-1 shadow-inner">
                        {/* HADIR */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student, 'Hadir')}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'Hadir'
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                              : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-950/40'
                          }`}
                        >
                          <span className="text-sm">🟢</span>
                          <span>HADIR</span>
                        </button>

                        {/* IJIN */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student, 'Ijin')}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'Ijin'
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                              : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-950/40'
                          }`}
                        >
                          <span className="text-sm">🟡</span>
                          <span>IJIN</span>
                        </button>

                        {/* ALPA */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student, 'Alpa')}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'Alpa'
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105'
                              : 'text-rose-400/70 hover:text-rose-300 hover:bg-rose-950/40'
                          }`}
                        >
                          <span className="text-sm">🔴</span>
                          <span>ALPA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Summary Success Dialog (Section 11) */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Laporan Presensi Sesi Latihan
              </span>
              <h3 className="text-xl font-extrabold text-white uppercase font-heading mt-1">
                ABSENSI BERHASIL DISIMPAN
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {selectedDay}, {selectedDate} • {identity.schoolName}
              </p>
            </div>

            {/* Metric Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                  <span className="text-slate-400">Total Peserta:</span>
                  <p className="text-lg font-bold text-white font-heading">{summaryData.total}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-left">
                  <span className="text-emerald-400">🟢 Hadir:</span>
                  <p className="text-lg font-bold text-emerald-400 font-heading">{summaryData.hadir}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-left">
                  <span className="text-amber-400">🟡 Ijin:</span>
                  <p className="text-lg font-bold text-amber-400 font-heading">{summaryData.ijin}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30 text-left">
                  <span className="text-rose-400">🔴 Alpa:</span>
                  <p className="text-lg font-bold text-rose-400 font-heading">{summaryData.alpa}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40">
                <p className="text-xs text-slate-300 font-medium">Persentase Kehadiran:</p>
                <p className="text-3xl font-black text-emerald-400 font-heading mt-0.5">
                  {summaryData.percentage.toLocaleString('id-ID')}%
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer uppercase tracking-wider"
            >
              Tutup & Kembali ke Aplikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
