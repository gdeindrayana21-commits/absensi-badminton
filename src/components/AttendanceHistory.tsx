import React, { useState, useMemo } from 'react';
import {
  AttendanceRecord,
  Student,
  AttendanceStatus,
  SchoolIdentity
} from '../types';
import {
  getAttendanceRecords,
  deleteAttendanceDate,
  setStudentAttendance
} from '../utils/storage';
import {
  exportDailyAttendancePdf,
  exportDailyAttendanceExcel
} from '../utils/exportUtils';
import {
  History,
  Calendar,
  Clock,
  Dumbbell,
  FileSpreadsheet,
  FileDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Users
} from 'lucide-react';
import { showToast } from './Toast';
import { EditSessionDateModal } from './EditSessionDateModal';

interface AttendanceHistoryProps {
  attendanceRecords?: AttendanceRecord[];
  students?: Student[];
  identity: SchoolIdentity;
  onNavigateToAttendance: (date: string) => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  attendanceRecords = [],
  students = [],
  identity,
  onNavigateToAttendance
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [deleteConfirmDate, setDeleteConfirmDate] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<{
    date: string;
    day: string;
    material: string;
    startTime: string;
    endTime: string;
    notes: string;
    recordsCount: number;
  } | null>(null);

  // Group records by date
  const sessions = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    attendanceRecords.forEach((rec) => {
      if (!map[rec.date]) {
        map[rec.date] = [];
      }
      map[rec.date].push(rec);
    });

    // Sort dates descending
    const dates = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return dates.map((date) => {
      const records = map[date];
      const sample = records[0];
      const hadir = records.filter((r) => r.status === 'Hadir').length;
      const ijin = records.filter((r) => r.status === 'Ijin').length;
      const alpa = records.filter((r) => r.status === 'Alpa').length;
      const total = records.length;
      const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        date,
        day: sample?.day || 'Sabtu',
        material: sample?.material || 'Latihan Bulutangkis',
        startTime: sample?.startTime || '07:30',
        endTime: sample?.endTime || '09:00',
        notes: sample?.notes || '',
        hadir,
        ijin,
        alpa,
        total,
        percentage: pct,
        records
      };
    }).filter((s) => {
      const match =
        s.date.includes(searchTerm) ||
        s.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.material.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [attendanceRecords, searchTerm]);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const handleDeleteSession = (date: string) => {
    const res = deleteAttendanceDate(date);
    if (res.success) {
      showToast(res.message, 'success');
      setDeleteConfirmDate(null);
    }
  };

  const handleQuickStatusChange = (
    rec: AttendanceRecord,
    newStatus: AttendanceStatus
  ) => {
    const student = students.find((s) => s.id === rec.studentId) || {
      id: rec.studentId,
      name: rec.studentName,
      grade: rec.studentGrade,
      absenNo: rec.studentAbsenNo,
      status: 'Aktif' as const
    };

    setStudentAttendance(
      rec.date,
      rec.day,
      student,
      newStatus,
      rec.startTime,
      rec.endTime,
      rec.material,
      rec.notes
    );

    showToast(`Status ${rec.studentName} diubah ke ${newStatus}`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
              📜 RIWAYAT SESI ABSENSI
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Total tercatat <strong className="text-emerald-400 font-bold">{sessions.length} sesi latihan</strong>
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tanggal, hari, materi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const isExpanded = !!expandedDates[session.date];

          return (
            <div
              key={session.date}
              className="sports-glass-card rounded-3xl border-emerald-500/20 overflow-hidden shadow-xl"
            >
              {/* Summary Bar */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center font-mono font-bold shrink-0 border border-emerald-500/30">
                    <span className="text-xs">{session.date.split('-')[1]}</span>
                    <span className="text-lg leading-none">{session.date.split('-')[2]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">
                        {session.day}, {session.date}
                      </h3>
                      <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {session.startTime} - {session.endTime} WITA
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium flex items-center gap-1.5 mt-0.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      {session.material}
                    </p>
                  </div>
                </div>

                {/* Counters */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    🟢 {session.hadir} Hadir
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    🟡 {session.ijin} Ijin
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                    🔴 {session.alpa} Alpa
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 font-heading">
                    {session.percentage}%
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                    <button
                      onClick={() =>
                        setEditingSession({
                          date: session.date,
                          day: session.day,
                          material: session.material,
                          startTime: session.startTime,
                          endTime: session.endTime,
                          notes: session.notes,
                          recordsCount: session.records.length
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      title="Edit Tanggal Pelaksanaan Kegiatan"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Edit Tanggal</span>
                    </button>
                    <button
                      onClick={() =>
                        exportDailyAttendancePdf(
                          session.records,
                          identity,
                          session.date,
                          session.day,
                          session.material,
                          session.startTime,
                          session.endTime
                        )
                      }
                      className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                      title="Download PDF Sesi Ini"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        exportDailyAttendanceExcel(
                          session.records,
                          identity,
                          session.date,
                          session.day,
                          session.material,
                          session.startTime,
                          session.endTime
                        )
                      }
                      className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                      title="Download Excel Sesi Ini"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmDate(session.date)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpand(session.date)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <span>Detail</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detail Records */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-12">No</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3 text-center">Kelas</th>
                          <th className="py-2.5 px-4 text-center">Status Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {session.records.map((rec, i) => (
                          <tr key={rec.id} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 text-center font-mono text-slate-400">
                              {i + 1}
                            </td>
                            <td className="py-2 px-3 font-medium text-white">
                              {rec.studentName}
                            </td>
                            <td className="py-2 px-3 text-center text-emerald-400">
                              {rec.studentGrade}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(rec, 'Hadir')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                    rec.status === 'Hadir'
                                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  🟢 Hadir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(rec, 'Ijin')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                    rec.status === 'Ijin'
                                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  🟡 Ijin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(rec, 'Alpa')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                    rec.status === 'Alpa'
                                      ? 'bg-rose-500 text-white font-extrabold'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  🔴 Alpa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Session Modal Confirmation */}
      {deleteConfirmDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                Hapus Seluruh Absensi Tanggal Ini?
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Seluruh rekaman absensi pada tanggal <strong className="text-white">{deleteConfirmDate}</strong> akan dihapus permanen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDate(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSession(deleteConfirmDate)}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Tanggal Pelaksanaan Kegiatan */}
      {editingSession && (
        <EditSessionDateModal
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          initialDate={editingSession.date}
          initialDay={editingSession.day}
          initialMaterial={editingSession.material}
          initialStartTime={editingSession.startTime}
          initialEndTime={editingSession.endTime}
          initialNotes={editingSession.notes}
          participantCount={editingSession.recordsCount}
          onSuccess={() => {
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
};
