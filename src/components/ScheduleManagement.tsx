import React, { useState } from 'react';
import { TrainingSchedule, BADMINTON_MATERIALS } from '../types';
import { saveSchedules, updateSchedule } from '../utils/storage';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Dumbbell,
  FileText,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle,
  X,
  Sparkles,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { showToast } from './Toast';

interface ScheduleManagementProps {
  schedules?: TrainingSchedule[];
  onNavigateToAttendance: (date: string) => void;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  schedules = [],
  onNavigateToAttendance
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const [formData, setFormData] = useState<Omit<TrainingSchedule, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: BADMINTON_MATERIALS[0],
    notes: 'Latihan rutin pembinaan teknik dan fisik.',
    status: 'Terjadwal'
  });

  const [editFormData, setEditFormData] = useState<TrainingSchedule>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    day: 'Sabtu',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Lapangan Bulutangkis SMA Negeri 1 Tejakula',
    material: BADMINTON_MATERIALS[0],
    notes: '',
    status: 'Terjadwal'
  });

  const handleDateChange = (dateVal: string) => {
    try {
      const d = new Date(dateVal);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
      setFormData((prev) => ({ ...prev, date: dateVal, day: dayName }));
    } catch {
      setFormData((prev) => ({ ...prev, date: dateVal }));
    }
  };

  const handleEditDateChange = (dateVal: string) => {
    try {
      const d = new Date(dateVal);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
      setEditFormData((prev) => ({ ...prev, date: dateVal, day: dayName }));
    } catch {
      setEditFormData((prev) => ({ ...prev, date: dateVal }));
    }
  };

  const handleOpenEdit = (sch: TrainingSchedule) => {
    setEditingSchedule(sch);
    setEditFormData({ ...sch });
  };

  const handleSaveEditSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    const res = updateSchedule(editingSchedule.id, editFormData);
    if (res.success) {
      showToast(res.message, 'success');
      setEditingSchedule(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule: TrainingSchedule = {
      ...formData,
      id: `sch-${Date.now()}`
    };

    const updated = [newSchedule, ...schedules];
    // Sort by date ascending
    updated.sort((a, b) => a.date.localeCompare(b.date));
    saveSchedules(updated);

    showToast('Jadwal latihan berhasil ditambahkan! 📅', 'success');
    setIsAddOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    saveSchedules(updated);
    showToast('Jadwal berhasil dihapus.', 'info');
  };

  const handleToggleStatus = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        const nextStatus = s.status === 'Selesai' ? 'Terjadwal' : 'Selesai';
        return { ...s, status: nextStatus as any };
      }
      return s;
    });
    saveSchedules(updated);
    showToast('Status jadwal diperbarui.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
              📅 JADWAL LATIHAN EKSTRAKURIKULER
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Agenda sesi latihan bulutangkis SMA Negeri 1 Tejakula
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'list' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kalender
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>➕ BUAT JADWAL LATIHAN</span>
          </button>
        </div>
      </div>

      {/* Content: List or Calendar View */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((sch) => {
            const isCompleted = sch.status === 'Selesai';

            return (
              <div
                key={sch.id}
                className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'sports-glass-card border-emerald-500/30 hover:border-emerald-400 shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      isCompleted
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    }`}
                  >
                    {sch.status || 'Terjadwal'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sch)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Edit Tanggal & Rincian Jadwal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(sch.id)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Ubah Status (Selesai/Terjadwal)"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(sch.id)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-white font-bold text-base">
                    <CalendarDays className="w-4 h-4 text-emerald-400" />
                    <span>
                      {sch.day}, {sch.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {sch.startTime} - {sch.endTime} WITA
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-semibold">{sch.material}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{sch.location}</span>
                  </div>
                  {sch.notes && (
                    <p className="text-[11px] text-slate-400 italic pl-5">"{sch.notes}"</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onNavigateToAttendance(sch.date)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Buka Absensi Tanggal Ini</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar view visualization */
        <div className="sports-glass p-6 rounded-3xl border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-heading uppercase flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              Timeline Kalender Sesi Latihan
            </h3>
            <span className="text-xs text-slate-400">{schedules.length} Sesi Terjadwal</span>
          </div>

          <div className="space-y-3">
            {schedules.map((sch, i) => (
              <div
                key={sch.id}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center font-mono font-bold shrink-0">
                  <span className="text-xs">{sch.date.split('-')[1]}</span>
                  <span className="text-base leading-none">{sch.date.split('-')[2]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {sch.day} • {sch.material}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{sch.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(sch)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Tanggal & Jadwal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigateToAttendance(sch.date)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    Absen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
                TAMBAH JADWAL LATIHAN
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Hari</label>
                  <input
                    type="text"
                    value={formData.day}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Tempat / Lokasi *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Materi / Jenis Latihan *</label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {BADMINTON_MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Keterangan / Catatan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan untuk peserta atau persiapan alat..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  SIMPAN JADWAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading uppercase">
                  EDIT JADWAL & TANGGAL PELAKSANAAN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Tanggal Pelaksanaan *</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => handleEditDateChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Hari Pelaksanaan</label>
                  <input
                    type="text"
                    value={editFormData.day}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Tempat / Lokasi *</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Status Jadwal</label>
                  <select
                    value={editFormData.status || 'Terjadwal'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Materi / Jenis Latihan *</label>
                <select
                  value={editFormData.material}
                  onChange={(e) => setEditFormData({ ...editFormData, material: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {BADMINTON_MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Keterangan / Catatan</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Catatan tambahan untuk peserta atau persiapan alat..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  SIMPAN PERUBAHAN JADWAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
