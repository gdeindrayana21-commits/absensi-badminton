import React, { useState, useEffect } from 'react';
import { SchoolIdentity } from '../types';
import { saveSchoolIdentity } from '../utils/storage';
import {
  FileDown,
  X,
  UserCheck,
  Building2,
  Check,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { showToast } from './Toast';

interface ExportPdfConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: SchoolIdentity;
  title?: string;
  documentDescription?: string;
  onConfirmDownload: (customIdentity: SchoolIdentity) => void;
}

export const ExportPdfConfirmModal: React.FC<ExportPdfConfirmModalProps> = ({
  isOpen,
  onClose,
  identity,
  title = 'Pengesahan Kepala Sekolah Sebelum Unduh PDF',
  documentDescription = 'Laporan Resmi Ekstrakurikuler Bulutangkis SMAN 1 Tejakula',
  onConfirmDownload
}) => {
  const [headmasterName, setHeadmasterName] = useState('');
  const [headmasterNip, setHeadmasterNip] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherNip, setTeacherNip] = useState('');
  const [saveAsPermanent, setSaveAsPermanent] = useState(true);

  // Sync with current identity when modal opens
  useEffect(() => {
    if (isOpen) {
      setHeadmasterName(identity.headmasterName || 'Drs. I Ketut Sumarta, M.Pd.');
      setHeadmasterNip(identity.headmasterNip || '196805141994031008');
      setTeacherName(identity.teacherName || 'I Gede Bayu Indrayana, S.Pd.');
      setTeacherNip(identity.nipppk || identity.teacherNip || '199406082024211008');
      setSaveAsPermanent(true);
    }
  }, [isOpen, identity]);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setHeadmasterName('Drs. I Ketut Sumarta, M.Pd.');
    setHeadmasterNip('196805141994031008');
    setTeacherName(identity.teacherName);
    setTeacherNip(identity.nipppk || identity.teacherNip);
    showToast('Nilai dikembalikan ke default data sekolah.', 'info');
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!headmasterName.trim()) {
      showToast('Nama Kepala Sekolah wajib diisi!', 'warning');
      return;
    }

    const updatedIdentity: SchoolIdentity = {
      ...identity,
      headmasterName: headmasterName.trim(),
      headmasterNip: headmasterNip.trim(),
      teacherName: teacherName.trim(),
      nipppk: teacherNip.trim()
    };

    // Save permanently to storage and firestore if user opted in
    if (saveAsPermanent) {
      saveSchoolIdentity(updatedIdentity);
    }

    onConfirmDownload(updatedIdentity);
    onClose();
  };

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl sports-glass rounded-3xl border border-emerald-500/30 p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide uppercase">
                {title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {documentDescription}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Pengesahan Resmi Berkas PDF</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Anda dapat menyesuaikan Nama dan NIP Kepala Sekolah di bawah ini. Nama yang dimasukkan akan tercetak langsung pada lembar tanda tangan dokumen PDF.
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Section: Data Kepala Sekolah */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Data Kepala Sekolah</span>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Kembalikan ke Default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nama Kepala Sekolah Lengkap beserta Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={headmasterName}
                  onChange={(e) => setHeadmasterName(e.target.value)}
                  placeholder="Contoh: Drs. I Ketut Sumarta, M.Pd."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  NIP Kepala Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={headmasterNip}
                  onChange={(e) => setHeadmasterNip(e.target.value)}
                  placeholder="Contoh: 196805141994031008"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Data Guru Pembina */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Data Guru Pembina</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nama Guru Pembina
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  NIPPPK / NIP Pembina
                </label>
                <input
                  type="text"
                  value={teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Tanda Tangan */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Pratinjau Format Lembar Pengesahan PDF:
            </p>
            <div className="bg-white text-slate-900 p-4 rounded-xl text-[11px] font-sans border border-slate-300 shadow-inner grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-600">Mengetahui,</p>
                <p className="text-[10px] text-emerald-700 italic font-medium">Ditandatangani secara elektronik oleh :</p>
                <p className="font-semibold text-slate-800">Kepala {identity.schoolName || 'SMA Negeri 1 Tejakula'}</p>
                <div className="h-10 flex items-end">
                  <p className="font-bold underline text-slate-900">
                    {headmasterName || '( ........................................ )'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-600">
                  NIP. {headmasterNip || '........................'}
                </p>
              </div>

              <div>
                <p className="text-slate-600">Tejakula, {todayFormatted}</p>
                <p className="font-semibold text-slate-800">Guru Pembina Bulutangkis</p>
                <div className="h-12 flex items-end">
                  <p className="font-bold underline text-slate-900">
                    {teacherName || '( ........................................ )'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-600">
                  NIPPPK. {teacherNip || '........................'}
                </p>
              </div>
            </div>
          </div>

          {/* Option to remember/save permanently */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
            <input
              type="checkbox"
              checked={saveAsPermanent}
              onChange={(e) => setSaveAsPermanent(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
            />
            <span className="text-xs text-slate-300 select-none">
              Simpan sebagai data kepala sekolah di pengaturan aplikasi (tersimpan otomatis untuk unduhan berikutnya)
            </span>
          </label>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh PDF Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
