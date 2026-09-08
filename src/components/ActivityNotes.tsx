import React, { useState } from 'react';
import { ActivityNote, BADMINTON_MATERIALS, SchoolIdentity } from '../types';
import { saveActivityNotes, updateActivityNote } from '../utils/storage';
import {
  FileText,
  Plus,
  Calendar,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Sparkles,
  Trash2,
  X,
  Edit2
} from 'lucide-react';
import { showToast } from './Toast';

interface ActivityNotesProps {
  activityNotes?: ActivityNote[];
  identity: SchoolIdentity;
}

export const ActivityNotes: React.FC<ActivityNotesProps> = ({
  activityNotes = [],
  identity
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ActivityNote | null>(null);

  const [formData, setFormData] = useState<Omit<ActivityNote, 'id' | 'timestamp'>>({
    date: new Date().toISOString().split('T')[0],
    material: BADMINTON_MATERIALS[0],
    participantCondition: 'Peserta hadir tepat waktu dengan fisik bugar dan antusiasme tinggi.',
    goodPoints: 'Penguasaan teknik footwork dan akurasi servis menunjukkan peningkatan pesat.',
    obstacles: 'Beberapa pemain masih kesulitan melakukan transisi bertahan ke menyerang pada permainan ganda.',
    followUp: 'Fokus drill rotasi ganda dan variasi netting silang pada sesi latihan berikutnya.',
    teacherNotes: 'Tetap jaga kedisiplinan dan kekompakan tim bulutangkis SMA Negeri 1 Tejakula.'
  });

  const [editFormData, setEditFormData] = useState<ActivityNote>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    material: BADMINTON_MATERIALS[0],
    participantCondition: '',
    goodPoints: '',
    obstacles: '',
    followUp: '',
    teacherNotes: '',
    timestamp: ''
  });

  const handleOpenEdit = (note: ActivityNote) => {
    setEditingNote(note);
    setEditFormData({ ...note });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    const res = updateActivityNote(editingNote.id, editFormData);
    if (res.success) {
      showToast(res.message, 'success');
      setEditingNote(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: ActivityNote = {
      ...formData,
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    const updated = [newNote, ...activityNotes];
    saveActivityNotes(updated);
    showToast('Catatan kegiatan latihan berhasil disimpan! 📝', 'success');
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = activityNotes.filter((n) => n.id !== id);
    saveActivityNotes(updated);
    showToast('Catatan kegiatan dihapus.', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
              📝 CATATAN KEGIATAN & EVALUASI LATIHAN
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jurnal evaluasi berkala Guru Pembina: <span className="text-emerald-400 font-bold">{identity.teacherName}</span>
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>➕ TULIS CATATAN KEGIATAN</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {activityNotes.map((note) => (
          <div
            key={note.id}
            className="sports-glass-card p-6 rounded-3xl border-emerald-500/20 space-y-4 hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Sesi Latihan: {note.date}
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {note.material}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Pembina: {identity.teacherName}
                </span>
                <button
                  onClick={() => handleOpenEdit(note)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Edit Tanggal & Catatan Kegiatan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Hapus Catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Kondisi Peserta
                </span>
                <p className="text-slate-300 leading-relaxed">{note.participantCondition}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-300 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hal Yang Sudah Baik
                </span>
                <p className="text-slate-300 leading-relaxed">{note.goodPoints}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1">
                <span className="font-bold text-amber-400 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Kendala / Hambatan
                </span>
                <p className="text-slate-300 leading-relaxed">{note.obstacles}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                <span className="font-bold text-cyan-400 uppercase flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5" /> Rencana Tindak Lanjut
                </span>
                <p className="text-slate-300 leading-relaxed">{note.followUp}</p>
              </div>
            </div>

            {note.teacherNotes && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 text-xs">
                <span className="font-bold text-emerald-300 uppercase text-[11px] block mb-0.5">
                  📌 Catatan Guru / Pembina:
                </span>
                <p className="text-slate-200 italic leading-relaxed">"{note.teacherNotes}"</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                TULIS JURNAL & CATATAN KEGIATAN
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Tanggal Sesi *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Materi Latihan *</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {BADMINTON_MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Kondisi Peserta</label>
                <textarea
                  rows={2}
                  value={formData.participantCondition}
                  onChange={(e) => setFormData({ ...formData, participantCondition: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Hal Yang Sudah Baik</label>
                <textarea
                  rows={2}
                  value={formData.goodPoints}
                  onChange={(e) => setFormData({ ...formData, goodPoints: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Kendala / Hambatan</label>
                <textarea
                  rows={2}
                  value={formData.obstacles}
                  onChange={(e) => setFormData({ ...formData, obstacles: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Rencana Tindak Lanjut</label>
                <textarea
                  rows={2}
                  value={formData.followUp}
                  onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Catatan Tambahan Guru Pembina</label>
                <textarea
                  rows={2}
                  value={formData.teacherNotes}
                  onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
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
                  SIMPAN JURNAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading uppercase">
                  EDIT CATATAN & TANGGAL KEGIATAN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tanggal Pelaksanaan *</span>
                  </label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Materi / Topik Latihan *</span>
                  </label>
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
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Kondisi & Kesiapan Fisik/Mental Peserta *
                </label>
                <textarea
                  rows={2}
                  value={editFormData.participantCondition}
                  onChange={(e) => setEditFormData({ ...editFormData, participantCondition: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Hal / Teknik Yang Sudah Baik *
                </label>
                <textarea
                  rows={2}
                  value={editFormData.goodPoints}
                  onChange={(e) => setEditFormData({ ...editFormData, goodPoints: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Kendala / Hambatan Yang Ditemukan *
                </label>
                <textarea
                  rows={2}
                  value={editFormData.obstacles}
                  onChange={(e) => setEditFormData({ ...editFormData, obstacles: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Rencana Tindak Lanjut *
                </label>
                <textarea
                  rows={2}
                  value={editFormData.followUp}
                  onChange={(e) => setEditFormData({ ...editFormData, followUp: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Catatan Tambahan Guru Pembina
                </label>
                <textarea
                  rows={2}
                  value={editFormData.teacherNotes}
                  onChange={(e) => setEditFormData({ ...editFormData, teacherNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  SIMPAN PERUBAHAN CATATAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
