import React, { useState, useEffect } from 'react';
import { BADMINTON_MATERIALS } from '../types';
import { updateAttendanceDate } from '../utils/storage';
import { showToast } from './Toast';
import {
  Calendar,
  Clock,
  Dumbbell,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface EditSessionDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string;
  initialDay?: string;
  initialMaterial?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialNotes?: string;
  participantCount?: number;
  onSuccess?: (newDate: string) => void;
}

export const EditSessionDateModal: React.FC<EditSessionDateModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialDay,
  initialMaterial = BADMINTON_MATERIALS[0],
  initialStartTime = '07:30',
  initialEndTime = '09:00',
  initialNotes = '',
  participantCount = 0,
  onSuccess
}) => {
  const [newDate, setNewDate] = useState(initialDate);
  const [newDay, setNewDay] = useState(initialDay || 'Sabtu');
  const [material, setMaterial] = useState(initialMaterial);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewDate(initialDate);
      setMaterial(initialMaterial);
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
      setNotes(initialNotes);

      try {
        const d = new Date(initialDate);
        const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
        setNewDay(dayName);
      } catch {
        setNewDay(initialDay || 'Sabtu');
      }
    }
  }, [isOpen, initialDate, initialDay, initialMaterial, initialStartTime, initialEndTime, initialNotes]);

  const handleDateChange = (dateVal: string) => {
    setNewDate(dateVal);
    try {
      const d = new Date(dateVal);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
      setNewDay(dayName);
    } catch {
      setNewDay('Sabtu');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      showToast('Pilih tanggal pelaksanaan yang valid.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = updateAttendanceDate(initialDate, newDate, {
      material,
      startTime,
      endTime,
      notes
    });

    setIsSubmitting(false);

    if (res.success) {
      showToast(res.message, 'success');
      if (onSuccess) onSuccess(newDate);
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const isDateChanged = initialDate !== newDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-white uppercase tracking-wide">
                EDIT TANGGAL PELAKSANAAN KEGIATAN
              </h3>
              <p className="text-xs text-slate-400">
                Ubah tanggal & rincian sesi latihan ekstrakurikuler
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Date vs New Date Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tanggal Semula</span>
            <span className="text-slate-300 font-mono font-medium">{initialDate}</span>
          </div>

          <div className="flex items-center text-emerald-400 px-2">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Tanggal Baru</span>
            <span className="text-emerald-300 font-mono font-bold">{newDate || '-'}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tanggal Baru Picker */}
          <div>
            <label className="block text-slate-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pilih Tanggal Pelaksanaan Baru *</span>
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => handleDateChange(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <div className="flex items-center justify-between mt-1.5 px-1 text-[11px]">
              <span className="text-slate-400">
                Hari Pelaksanaan: <strong className="text-emerald-400 font-bold">{newDay}</strong>
              </span>
              {isDateChanged && (
                <span className="text-amber-400 font-medium">
                  ⚠️ Tanggal berubah
                </span>
              )}
            </div>
          </div>

          {/* Jam Pelaksanaan */}
          <div>
            <label className="block text-slate-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jam Pelaksanaan (WITA)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Mulai:</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Selesai:</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Materi Kegiatan */}
          <div>
            <label className="block text-slate-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Materi Latihan / Kegiatan</span>
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {BADMINTON_MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Catatan Sesi */}
          <div>
            <label className="block text-slate-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catatan Tambahan Kegiatan (Opsional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Latihan intensif persiapan turnamen O2SN"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notification Info Banner */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-[11px] text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Perubahan ini akan otomatis memperbarui tanggal sesi untuk{' '}
              <strong className="text-emerald-400 font-bold">
                {participantCount > 0 ? `${participantCount} data presensi siswa` : 'seluruh data presensi'}
              </strong>{' '}
              pada sesi tersebut.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Tanggal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
