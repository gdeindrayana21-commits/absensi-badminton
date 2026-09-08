import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  CLASS_OPTIONS,
  BADMINTON_MATERIALS
} from '../types';
import {
  setStudentAttendance,
  saveBulkAttendance
} from '../utils/storage';
import {
  Zap,
  Calendar,
  Search,
  CheckCircle2,
  Table,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Users,
  Percent,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { showToast } from './Toast';

interface AttendanceQuickMobileProps {
  students?: Student[];
  attendanceRecords?: AttendanceRecord[];
  onSwitchToTable: () => void;
}

export const AttendanceQuickMobile: React.FC<AttendanceQuickMobileProps> = ({
  students = [],
  attendanceRecords = [],
  onSwitchToTable
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | AttendanceStatus>('Semua');

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [lastUpdatedStudent, setLastUpdatedStudent] = useState<string>('');

  useEffect(() => {
    try {
      const d = new Date(selectedDate);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
      setSelectedDay(dayName);
    } catch {
      setSelectedDay('Sabtu');
    }
  }, [selectedDate]);

  // Load existing attendance for selectedDate or default all active students to 'Hadir'
  useEffect(() => {
    const existing = attendanceRecords.filter((r) => r.date === selectedDate);
    const existingMap: Record<string, AttendanceStatus> = {};
    existing.forEach((rec) => {
      existingMap[rec.studentId] = rec.status;
    });

    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      if (s.status === 'Aktif') {
        // PERBAIKAN: Selalu default ke 'Hadir' untuk siswa yang belum memiliki data status khusus pada tanggal ini
        map[s.id] = existingMap[s.id] || 'Hadir';
      }
    });

    setAttendanceMap(map);
  }, [selectedDate, attendanceRecords, students]);

  // Handle Quick Status for a single student (Hadir / Ijin / Alpa)
  const handleQuickStatus = (student: Student, status: AttendanceStatus) => {
    // 1. Update state optimis untuk satu siswa ini saja
    const updatedMap: Record<string, AttendanceStatus> = { ...attendanceMap, [student.id]: status };
    students.forEach((s) => {
      if (s.status === 'Aktif' && !updatedMap[s.id]) {
        updatedMap[s.id] = 'Hadir';
      }
    });

    setAttendanceMap(updatedMap);
    setLastUpdatedStudent(student.id);

    // 2. Simpan ke database: Jika sesi tanggal ini baru (belum pernah ada rekaman),
    // simpan seluruh batch agar siswa lainnya tercatat Hadir secara permanen di database dan tidak berubah jadi Alpa.
    const existingForDate = attendanceRecords.filter((r) => r.date === selectedDate);
    if (existingForDate.length <= 1) {
      saveBulkAttendance(
        selectedDate,
        selectedDay,
        updatedMap,
        '07:30',
        '09:00',
        BADMINTON_MATERIALS[0]
      );
    } else {
      setStudentAttendance(
        selectedDate,
        selectedDay,
        student,
        status,
        '07:30',
        '09:00',
        BADMINTON_MATERIALS[0]
      );
    }

    // Haptic vibration feedback on mobile browsers if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    const emoji = status === 'Hadir' ? '🟢' : status === 'Ijin' ? '🟡' : '🔴';
    showToast(`${emoji} ${student.name}: ${status}`, 'success');
  };

  const handleMarkAllHadir = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      if (s.status === 'Aktif') {
        newMap[s.id] = 'Hadir';
      }
    });
    setAttendanceMap(newMap);

    saveBulkAttendance(
      selectedDate,
      selectedDay,
      newMap,
      '07:30',
      '09:00',
      BADMINTON_MATERIALS[0]
    );

    showToast('Semua peserta ditandai Hadir! 🟢', 'success');
  };

  // Navigasi tanggal cepat untuk HP (1 hari ke belakang / ke depan)
  const shiftDate = (days: number) => {
    try {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + days);
      setSelectedDate(d.toISOString().split('T')[0]);
    } catch {}
  };

  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const countHadir = activeStudents.filter((s) => (attendanceMap[s.id] || 'Hadir') === 'Hadir').length;
  const countIjin = activeStudents.filter((s) => attendanceMap[s.id] === 'Ijin').length;
  const countAlpa = activeStudents.filter((s) => attendanceMap[s.id] === 'Alpa').length;
  const pct = activeStudents.length > 0 ? ((countHadir / activeStudents.length) * 100).toFixed(0) : '0';

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = !selectedGrade || s.grade === selectedGrade;
    const currentStatus = attendanceMap[s.id] || 'Hadir';
    const matchStatus = statusFilter === 'Semua' || currentStatus === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-14">
      {/* Sticky Top Quick Control on Mobile */}
      <div className="sticky top-20 z-30 sports-glass p-4 rounded-3xl border-emerald-500/30 shadow-2xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading uppercase flex items-center gap-1.5">
                ⚡ ABSENSI CEPAT HP
              </h2>
              <p className="text-[11px] text-emerald-400 font-semibold">
                {selectedDay}, {selectedDate} • {pct}% Kehadiran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllHadir}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Semua Hadir"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Semua Hadir</span>
            </button>
            <button
              onClick={onSwitchToTable}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Filter Chips / Counters */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('Semua')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Semua'
                ? 'bg-slate-800 border-slate-600 text-white font-bold ring-1 ring-white/30'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-[10px] block">Semua</span>
            <p className="font-bold text-white font-heading">{activeStudents.length}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Hadir' ? 'Semua' : 'Hadir')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Hadir'
                ? 'bg-emerald-900 border-emerald-400 text-emerald-200 font-bold ring-2 ring-emerald-500/40'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <span className="text-[10px] font-semibold block">🟢 Hadir</span>
            <p className="font-bold text-emerald-300 font-heading">{countHadir}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Ijin' ? 'Semua' : 'Ijin')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Ijin'
                ? 'bg-amber-900 border-amber-400 text-amber-200 font-bold ring-2 ring-amber-500/40'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
          >
            <span className="text-[10px] font-semibold block">🟡 Ijin</span>
            <p className="font-bold text-amber-300 font-heading">{countIjin}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Alpa' ? 'Semua' : 'Alpa')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Alpa'
                ? 'bg-rose-900 border-rose-400 text-rose-200 font-bold ring-2 ring-rose-500/40'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}
          >
            <span className="text-[10px] font-semibold block">🔴 Alpa</span>
            <p className="font-bold text-rose-300 font-heading">{countAlpa}</p>
          </button>
        </div>

        {/* Date Selector with Quick Step Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs text-center focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {selectedDate !== todayIso && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayIso)}
                className="px-2 py-1.5 rounded-xl bg-slate-800 text-[10px] font-bold text-emerald-400 hover:bg-slate-700 cursor-pointer whitespace-nowrap"
              >
                Hari Ini
              </button>
            )}
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">Semua Kelas</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 Cari nama siswa..."
            className="w-full pl-8 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards List */}
      {filtered.length === 0 ? (
        <div className="sports-glass p-8 text-center rounded-3xl border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-300">Tidak ada peserta yang ditemukan</p>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter kelas/status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((student) => {
            // PERBAIKAN: Default selalu 'Hadir', BUKAN 'Alpa'
            const currentStatus = attendanceMap[student.id] || 'Hadir';
            const isJustUpdated = lastUpdatedStudent === student.id;

            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isJustUpdated
                    ? 'border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'sports-glass-card border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      {student.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Kelas: <span className="text-emerald-400 font-bold">{student.grade}</span>
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      currentStatus === 'Hadir'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : currentStatus === 'Ijin'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {currentStatus}
                  </span>
                </div>

                {/* 3 Touch Buttons with Optimal Touch Targets & Feedback */}
                <div className="grid grid-cols-3 gap-2">
                  {/* HADIR */}
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(student, 'Hadir')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      currentStatus === 'Hadir'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                  >
                    <span>🟢</span>
                    <span>HADIR</span>
                  </button>

                  {/* IJIN */}
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(student, 'Ijin')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      currentStatus === 'Ijin'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                        : 'bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-amber-950/40'
                    }`}
                  >
                    <span>🟡</span>
                    <span>IJIN</span>
                  </button>

                  {/* ALPA */}
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(student, 'Alpa')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      currentStatus === 'Alpa'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-950/40'
                    }`}
                  >
                    <span>🔴</span>
                    <span>ALPA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

