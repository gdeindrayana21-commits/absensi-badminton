import React, { useState, useEffect } from 'react';
import { BadmintonLogo } from './BadmintonLogo';
import { SchoolIdentity, UserAccount } from '../types';
import {
  Clock,
  Calendar,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  FileSpreadsheet,
  FileText,
  Save,
  Zap,
  Award
} from 'lucide-react';
import { exportMasterDatabaseExcel, exportOfficialSchoolPDF } from '../utils/exportUtils';
import { showToast } from './Toast';

interface NavbarProps {
  identity: SchoolIdentity;
  user: UserAccount | null;
  onLogout: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  identity,
  user,
  onLogout,
  toggleSidebar,
  isSidebarOpen,
  activeTab,
  setActiveTab
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [dayStr, setDayStr] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      );
      setDayStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long'
        })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickExcel = () => {
    const name = exportMasterDatabaseExcel();
    showToast(`File Excel ${name} berhasil diunduh!`, 'success');
  };

  const handleQuickPDF = () => {
    const name = exportOfficialSchoolPDF();
    showToast(`Dokumen PDF ${name} berhasil dibuat!`, 'success');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-emerald-900/30 text-white shadow-xl">
      {/* Top School Slogan Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-4 py-1 border-b border-emerald-500/20 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 text-[11px]">
            <Sparkles className="w-3 h-3 animate-pulse" /> Slogan Sekolah
          </span>
          <span className="italic font-medium text-emerald-200">"{identity.slogan}"</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" /> TA: {identity.academicYear} ({identity.semester})
          </span>
          <span className="flex items-center gap-1.5 font-mono text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/20">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">{dayStr}</span>, {dateStr} • {time}
          </span>
        </div>
      </div>

      {/* Main App Identity Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors flex items-center justify-center cursor-pointer"
            aria-label={isSidebarOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            title={isSidebarOpen ? 'Sembunyikan Menu Navigasi' : 'Tampilkan Menu Navigasi'}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <BadmintonLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-wider text-white font-heading group-hover:text-emerald-300 transition-colors uppercase">
                  {identity.schoolName}
                </h1>
                <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                  Ekskul Pro
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 tracking-wide">
                {identity.appTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Teacher Credential Badge & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick export shortcuts on desktop */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handleQuickExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-950/60 rounded-lg transition-colors"
              title="Download Master Database Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handleQuickPDF}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-950/60 rounded-lg transition-colors"
              title="Download Laporan Resmi PDF"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cetak PDF</span>
            </button>
          </div>

          {/* Quick Mobile Absen Button */}
          <button
            onClick={() => setActiveTab('quick-absent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              activeTab === 'quick-absent'
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Absen Cepat</span>
          </button>

          {/* Teacher Profile Pill */}
          <div
            onClick={() => setActiveTab('settings')}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800/90 rounded-xl border border-slate-700/80 shadow-inner cursor-pointer hover:border-emerald-500/40 transition-colors group"
            title="Kelola Profil & Foto Guru"
          >
            {identity.teacherPhoto ? (
              <img
                src={identity.teacherPhoto}
                alt={identity.teacherName}
                className="w-8 h-8 rounded-lg object-cover border border-emerald-500/50 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="text-left">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                <span className="truncate max-w-[140px]">{identity.teacherName}</span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pembina
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">NIPPPK: {identity.nipppk || identity.teacherNip}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
            title="Keluar / Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
