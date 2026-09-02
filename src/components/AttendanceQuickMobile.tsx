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
  getAttendanceRecords
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
  Percent
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

  useEffect(() => {
    const existing = attendanceRecords.filter((r) => r.date === selectedDate);
    const map: Record<string, AttendanceStatus> = {};

    if (existing.length > 0) {
      existing.forEach((rec) => {
        map[rec.studentId] = rec.status;
      });
    } else {
      students.forEach((s) => {
        if (s.status === 'Aktif') {
          map[s.id] = 'Hadir';
        }
      });
    }
    setAttendanceMap(map);
  }, [selectedDate, attendanceRecords, students]);

  const handleQuickStatus = (student: Student, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [student.id]: status }));
    setLastUpdatedStudent(student.id);

    setStudentAttendance(
      selectedDate,
      selectedDay,
      student,
      status,
      '07:30',
      '09:00',
      BADMINTON_MATERIALS[0]
    );

    // Haptic vibration feedback on mobile browsers if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    showToast(`✅ ${student.name}: ${status}`, 'success');
  };

  const handleMarkAllHadir = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      if (s.status === 'Aktif') {
        newMap[s.id] = 'Hadir';
        setStudentAttendance(selectedDate, selectedDay, s, 'Hadir', '07:30', '09:00', BADMINTON_MATERIALS[0]);
      }
    });
    setAttendanceMap(newMap);
    showToast('Semua peserta ditandai Hadir! 🟢', 'success');
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.absenNo.toString().includes(searchTerm);
    const matchGrade = !selectedGrade || s.grade === selectedGrade;
    return matchSearch && matchGrade;
  });

  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const countHadir = activeStudents.filter((s) => (attendanceMap[s.id] || 'Alpa') === 'Hadir').length;
  const countIjin = activeStudents.filter((s) => attendanceMap[s.id] === 'Ijin').length;
  const countAlpa = activeStudents.filter((s) => attendanceMap[s.id] === 'Alpa').length;
  const pct = activeStudents.length > 0 ? ((countHadir / activeStudents.length) * 100).toFixed(0) : '0';

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
                {selectedDay}, {selectedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllHadir}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 hover:bg-emerald-950/40 transition-colors"
              title="Semua Hadir"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onSwitchToTable}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
          <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400">Total</span>
            <p className="font-bold text-white font-heading">{activeStudents.length}</p>
          </div>
          <div className="p-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
            <span className="text-[10px] text-emerald-400 font-semibold">🟢 Hadir</span>
            <p className="font-bold text-emerald-300 font-heading">{countHadir}</p>
          </div>
          <div className="p-1.5 rounded-xl bg-amber-950/50 border border-amber-500/40">
            <span className="text-[10px] text-amber-400 font-semibold">🟡 Ijin</span>
            <p className="font-bold text-amber-300 font-heading">{countIjin}</p>
          </div>
          <div className="p-1.5 rounded-xl bg-rose-950/50 border border-rose-500/40">
            <span className="text-[10px] text-rose-400 font-semibold">🔴 Alpa</span>
            <p className="font-bold text-rose-300 font-heading">{countAlpa}</p>
          </div>
        </div>

        {/* Date & Filter */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
          />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
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
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Cards List (Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((student) => {
          const currentStatus = attendanceMap[student.id] || 'Alpa';
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
                    <span className="text-emerald-400 font-bold">{student.grade}</span> — Absen {student.absenNo}
                  </p>
                </div>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
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

              {/* 3 Touch Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {/* HADIR */}
                <button
                  type="button"
                  onClick={() => handleQuickStatus(student, 'Hadir')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
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
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
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
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
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
    </div>
  );
};
