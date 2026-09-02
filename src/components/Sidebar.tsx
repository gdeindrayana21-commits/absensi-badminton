import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Zap,
  CalendarDays,
  Dumbbell,
  Camera,
  BarChart3,
  History,
  Download,
  Database,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, desc: 'Statistik & Ringkasan' },
    { id: 'students', label: 'Data Peserta', icon: Users, badge: null, desc: 'CRUD & Import Excel' },
    { id: 'attendance', label: 'Absensi Harian', icon: ClipboardCheck, badge: 'Utama', desc: 'Presensi Sesi Latihan' },
    { id: 'quick-absent', label: 'Absensi Cepat', icon: Zap, badge: '⚡ HP', desc: 'Kartu Presensi Instan' },
    { id: 'schedules', label: 'Jadwal Latihan', icon: CalendarDays, badge: null, desc: 'Kalender & Agenda' },
    { id: 'activities', label: 'Kegiatan & Materi', icon: Dumbbell, badge: null, desc: 'Evaluasi & Catatan' },
    { id: 'documentation', label: 'Dokumentasi', icon: Camera, badge: null, desc: 'Galeri Foto Latihan' },
    { id: 'recap', label: 'Rekap & Ranking', icon: BarChart3, badge: '🏆', desc: 'Analisis & Peringatan' },
    { id: 'history', label: 'Riwayat Absensi', icon: History, badge: null, desc: 'Log & Koreksi Status' },
    { id: 'export', label: 'Download Laporan', icon: Download, badge: 'XLS/PDF', desc: 'Format Resmi Sekolah' },
    { id: 'backup', label: 'Backup & Restore', icon: Database, badge: null, desc: 'Cadangkan Data' },
    { id: 'settings', label: 'Pengaturan', icon: Settings, badge: null, desc: 'Identitas Sekolah' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[88px] sm:top-[84px] bottom-0 left-0 z-40 w-64 sm:w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-emerald-950/40 p-4 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-emerald-950/50' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between gap-6">
          <div>
            <div className="px-3 pb-3 mb-2 border-b border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Menu Navigasi
              </span>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-950/50 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block">{item.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            isActive
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Court Status Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-300">Sistem Presensi Aktif</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Data tersinkron otomatis & siap unduh format administrasi sekolah.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
