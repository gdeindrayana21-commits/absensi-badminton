import React, { useState } from 'react';
import { SchoolIdentity } from '../types';
import {
  saveIdentity,
  exportFullBackupJson,
  importBackupJson,
  resetToInitialData,
  compressImageBase64,
  syncCloudNow
} from '../utils/storage';
import {
  Settings,
  School,
  UserCheck,
  Clock,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Lock,
  KeyRound,
  Camera,
  User,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  Smartphone,
  Laptop,
  Cloud,
  QrCode,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { showToast } from './Toast';

interface SettingsPageProps {
  identity: SchoolIdentity;
  onIdentityUpdate: (newIdentity: SchoolIdentity) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  identity,
  onIdentityUpdate
}) => {
  const [formData, setFormData] = useState<SchoolIdentity>({ ...identity });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
      showToast('Tautan berhasil disalin! Buka link ini di browser HP Anda.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Gagal menyalin link otomatis.', 'warning');
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses foto guru...', 'info');
      const compressedBase64 = await compressImageBase64(file, 600, 600, 0.75);
      setFormData((prev) => ({
        ...prev,
        teacherPhoto: compressedBase64
      }));
      showToast('Foto guru pembina berhasil dimuat! Klik "Simpan Perubahan" untuk menyimpan.', 'success');
    } catch {
      showToast('Gagal memproses foto guru.', 'error');
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      teacherPhoto: ''
    }));
    showToast('Foto guru pembina dihapus.', 'info');
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolIdentity = {
      ...formData,
      adminPassword: newPassword.trim() ? newPassword.trim() : formData.adminPassword
    };

    if (newPassword.trim() && newPassword !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    saveIdentity(updated);
    onIdentityUpdate(updated);
    showToast('Identitas sekolah & pembina berhasil disimpan! ✅', 'success');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExportBackup = () => {
    exportFullBackupJson();
    showToast('File backup database JSON berhasil diunduh! 💾', 'success');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const jsonStr = evt.target?.result as string;
        const res = importBackupJson(jsonStr);
        if (res.success) {
          showToast(res.message, 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast(res.message, 'error');
        }
      } catch (err: any) {
        showToast(`Gagal membaca file JSON: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetToInitialData();
    showToast('Database berhasil direset ke data awal demo.', 'info');
    setIsResetConfirmOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-14">
      {/* Header */}
      <div className="sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
            ⚙️ PENGATURAN SISTEM & DATABASE
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Kelola identitas resmi sekolah, informasi guru pembina, dan backup data absensi.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSaveIdentity} className="space-y-6">
        {/* Section 1: Identitas Sekolah */}
        <div className="sports-glass-card p-6 rounded-3xl border-emerald-500/20 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white font-heading uppercase border-b border-slate-800 pb-3">
            <School className="w-4 h-4 text-emerald-400" />
            <span>IDENTITAS SEKOLAH</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Nama Sekolah Resmi *
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Slogan Sekolah
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Tahun Ajaran / Periode
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Lokasi / Tempat Latihan Default
              </label>
              <input
                type="text"
                value={formData.defaultLocation}
                onChange={(e) => setFormData({ ...formData, defaultLocation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Data Guru Pembina */}
        <div className="sports-glass-card p-6 rounded-3xl border-emerald-500/20 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white font-heading uppercase border-b border-slate-800 pb-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>DATA GURU PEMBINA EKSTRAKURIKULER</span>
          </div>

          {/* Teacher Photo Upload Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              {formData.teacherPhoto ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/20">
                  <img
                    src={formData.teacherPhoto}
                    alt={formData.teacherName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                    title="Hapus foto guru"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
                  <User className="w-8 h-8 text-slate-600" />
                  <span className="text-[9px] uppercase tracking-wider mt-1 text-slate-500">Tanpa Foto</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase flex items-center justify-center sm:justify-start gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  Foto Profil Guru Pembina
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Foto ini akan tampil pada Navbar, halaman Dashboard, serta Laporan Administrasi. Format: JPG, PNG, WebP (maks. 2MB).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  id="teacher-photo-input"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="teacher-photo-input"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.teacherPhoto ? 'Ganti Foto' : 'Unggah Foto Guru'}</span>
                </label>

                {formData.teacherPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Nama Lengkap & Gelar Guru Pembina *
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                NIPPPK / NIP *
              </label>
              <input
                type="text"
                value={formData.nipppk}
                onChange={(e) => setFormData({ ...formData, nipppk: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Jadwal Latihan Rutin
              </label>
              <input
                type="text"
                value={formData.defaultSchedule}
                onChange={(e) => setFormData({ ...formData, defaultSchedule: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Jam Latihan (WITA)
              </label>
              <input
                type="text"
                value={formData.defaultTime}
                onChange={(e) => setFormData({ ...formData, defaultTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Keamanan & Password Guru */}
        <div className="sports-glass-card p-6 rounded-3xl border-emerald-500/20 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white font-heading uppercase border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>KEAMANAN LOGIN GURU</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Password Baru (Kosongkan jika tidak diganti)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 4 karakter..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>SIMPAN SEMUA PERUBAHAN</span>
          </button>
        </div>
      </form>

      {/* Cloud Sync & Cross-Device Pairing (Laptop <-> HP) */}
      <div className="sports-glass p-6 rounded-3xl border-emerald-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide">
                ☁️ SINKRONISASI CLOUD OTOMATIS (LAPTOP & HP)
              </h3>
              <p className="text-xs text-slate-400">
                Data presensi, siswa, dan jadwal tersambung otomatis secara real-time via Google Cloud Firestore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'SINKRONKAN SEKARANG'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Status Info */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-300">Firestore Cloud Terhubung</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setiap kali Anda mengisi absensi atau memperbarui jadwal di HP, perubahan akan langsung muncul di laptop tanpa perlu refresh.
            </p>
          </div>

          {/* Quick Copy Link */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Buka di Smartphone (HP)</span>
            </div>
            <p className="text-xs text-slate-400">
              Salin tautan ini dan kirim ke WhatsApp Anda untuk dibuka di browser HP:
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tautan Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salin Tautan Link HP</span>
                </>
              )}
            </button>
          </div>

          {/* QR Code */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scan QR Code dari HP</span>
            </div>
            {currentUrl && (
              <div className="p-1.5 bg-slate-950 rounded-xl border border-emerald-500/30">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}&bgcolor=020617&color=34d399`}
                  alt="QR Code HP"
                  className="w-24 h-24 rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <span className="text-[10px] text-slate-500">Arahkan kamera HP ke kode ini</span>
          </div>
        </div>
      </div>

      {/* Section 4: Backup & Restore Data (Section 21) */}
      <div className="sports-glass p-6 rounded-3xl border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-heading uppercase border-b border-slate-800 pb-3">
          <FileJson className="w-4 h-4 text-cyan-400" />
          <span>💾 BACKUP & RESTORE DATABASE (AMAN)</span>
        </div>

        <p className="text-xs text-slate-300">
          Simpan cadangan data absensi, data siswa, jadwal latihan, catatan kegiatan, dan dokumentasi foto ke file JSON. Anda dapat memulihkannya kapan saja di perangkat lain.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Download Backup */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-cyan-950/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all shadow cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>📥 DOWNLOAD BACKUP DATABASE (.JSON)</span>
          </button>

          {/* Restore Backup */}
          <label className="px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all shadow cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>📤 RESTORE DARI FILE BACKUP (.JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset demo data */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-rose-500/40 hover:bg-rose-950/40 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all shadow cursor-pointer ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>RESET KE DATA AWAL DEMO</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                Konfirmasi Reset Database
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Apakah Anda yakin ingin mereset seluruh database kembali ke data awal demo SMAN 1 Tejakula? Semua perubahan Anda akan digantikan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                YA, RESET DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
