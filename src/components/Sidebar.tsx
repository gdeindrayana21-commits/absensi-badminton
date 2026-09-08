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
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSyncModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenSyncModal
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

  const renderNavList = (isMobile: boolean) => (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`${isMobile ? 'mobile-' : ''}nav-${item.id}`}
            onClick={() => {
              setActiveTab(item.id);
              if (isMobile) {
                onClose();
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer group ${
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
  );

  const statusBadge = (
    <div
      onClick={onOpenSyncModal}
      className={`p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/25 hover:border-emerald-500/50 transition-all text-center group ${
        onOpenSyncModal ? 'cursor-pointer hover:bg-slate-800/80 shadow-md' : ''
      }`}
      title="Klik untuk melihat Status Sinkronisasi Cloud Laptop & HP"
    >
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
          Sinkron Laptop & HP Aktif
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Data terhubung via Firebase Cloud. Klik untuk scan QR Code atau salin link HP.
      </p>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop - closes drawer when tapped outside */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Only on screens < 1024px, fixed overlay with clear close button) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-950/98 backdrop-blur-2xl border-r border-emerald-900/40 p-4 flex flex-col justify-between overflow-y-auto shadow-2xl shadow-emerald-950/80 transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full justify-between gap-6">
          <div>
            <div className="flex items-center justify-between px-1 pb-3 mb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Menu Navigasi
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Tutup menu navigasi"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderNavList(true)}
          </div>

          {statusBadge}
        </div>
      </aside>

      {/* Desktop In-Flow Sidebar (Only on screens >= 1024px, sits BESIDE main content so it NEVER covers the screen) */}
      {isOpen && (
        <aside className="hidden lg:flex lg:flex-col w-64 xl:w-72 shrink-0 sticky top-[92px] self-start max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl sports-glass border border-emerald-950/40 p-4 shadow-xl z-20">
          <div className="flex flex-col h-full justify-between gap-6">
            <div>
              <div className="px-2 pb-3 mb-2 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Menu Navigasi
                </span>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Sembunyikan Menu"
                  aria-label="Sembunyikan Menu Navigasi"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {renderNavList(false)}
            </div>

            {statusBadge}
          </div>
        </aside>
      )}
    </>
  );
};
