import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Smartphone,
  Laptop,
  Copy,
  Check,
  QrCode,
  X,
  Wifi,
  WifiOff,
  Database,
  Users,
  Calendar,
  FileText,
  Camera,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';
import {
  subscribeSyncStatus,
  getSyncState,
  syncCloudNow,
  SyncStatus,
  CloudSyncState
} from '../utils/storage';
import { showToast } from './Toast';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  counts: {
    students: number;
    attendance: number;
    schedules: number;
    notes: number;
    docs: number;
  };
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  counts
}) => {
  const [syncState, setSyncState] = useState<CloudSyncState>(getSyncState());
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }

    const unsub = subscribeSyncStatus((state) => {
      setSyncState(state);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && currentUrl) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement('input');
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast('Tautan berhasil disalin! Buka tautan ini di browser HP Anda.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Gagal menyalin link otomatis. Silakan salin manual dari kotak teks.', 'warning');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncCloudNow();
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast('Gagal sinkronisasi: ' + (e?.message || 'Koneksi terganggu'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // QR Code URL generator using standard reliable generator
  const qrCodeUrl = currentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&bgcolor=0f172a&color=34d399`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
              <ArrowRightLeft className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading uppercase tracking-wide">
                  SINKRONISASI LAPTOP & HP
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data presensi otomatis terhubung antara komputer laptop dan ponsel cerdas (HP)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup modal sinkronisasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-teal-950/60 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  Cloud Database Firestore Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Setiap kali Anda absen di HP, laptop akan langsung terupdate otomatis tanpa refresh.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sinkron...' : 'Sinkron Sekarang'}</span>
          </button>
        </div>

        {/* Device Pairing Illustration */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md">
              <Laptop className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white">Laptop / PC</span>
            <span className="text-[10px] text-emerald-400 font-mono">Terhubung</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-emerald-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></span>
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span className="w-6 sm:w-12 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Auto-Sync</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white">Smartphone HP</span>
            <span className="text-[10px] text-emerald-400 font-mono">Terhubung</span>
          </div>
        </div>

        {/* Step-by-Step Instructions & QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: QR Code to Scan */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center justify-center space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase">
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code dari HP</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Arahkan kamera HP Anda ke QR code ini untuk langsung membuka aplikasi:
            </p>

            {qrCodeUrl ? (
              <div className="p-2 bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Buka di HP"
                  className="w-36 h-36 rounded-xl object-contain"
                  loading="lazy"
                />
              </div>
            ) : null}

            <span className="text-[10px] text-slate-500 font-mono">
              Buka link di browser Chrome atau Safari HP
            </span>
          </div>

          {/* Right: Copy Link Input */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase mb-1">
                <Smartphone className="w-4 h-4" />
                <span>Salin Tautan Link HP</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Atau kirim tautan ini ke WhatsApp Anda sendiri, lalu klik untuk membukanya di HP:
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs break-all select-all">
                {currentUrl || 'Memuat link...'}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Tautan Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-400" />
                    <span>Salin Link untuk Dibuka di HP</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300">
              💡 <strong>Tips Pembina:</strong> Simpan halaman ini sebagai shortcut di Layar Utama HP (Add to Home Screen) agar berfungsi seperti aplikasi asli!
            </div>
          </div>
        </div>

        {/* Synced Data Breakdown */}
        <div className="border-t border-slate-800 pt-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data yang Tersinkronisasi Otomatis</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Peserta Ekskul</p>
                <p className="font-bold text-white font-mono">{counts.students} Siswa</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Rekaman Presensi</p>
                <p className="font-bold text-white font-mono">{counts.attendance} Data</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Agenda Latihan</p>
                <p className="font-bold text-white font-mono">{counts.schedules} Sesi</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Jurnal Catatan</p>
                <p className="font-bold text-white font-mono">{counts.notes} Catatan</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Dokumentasi</p>
                <p className="font-bold text-white font-mono">{counts.docs} Foto</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Identitas Sekolah</p>
                <p className="font-bold text-white text-[11px] truncate">SMA N 1 Tejakula</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
