import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  AttendanceRecord,
  TrainingSchedule,
  SchoolIdentity,
  AttendanceSummary
} from '../types';
import { calculateAttendanceSummaries } from '../utils/storage';
import {
  Users,
  CheckCircle,
  Clock,
  AlertOctagon,
  Percent,
  Trophy,
  Calendar,
  Sparkles,
  Play,
  Square,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Award,
  ChevronRight,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { showToast } from './Toast';

interface DashboardProps {
  identity: SchoolIdentity;
  students?: Student[];
  attendanceRecords?: AttendanceRecord[];
  schedules?: TrainingSchedule[];
  summaries?: AttendanceSummary[];
  onNavigate: (tab: string) => void;
  onSelectStudent: (student: Student) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  identity,
  students = [],
  attendanceRecords = [],
  schedules = [],
  summaries,
  onNavigate,
  onSelectStudent
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [currentDayStr, setCurrentDayStr] = useState<string>('');
  
  // Live session timer state
  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(() => {
    return localStorage.getItem('badminton_session_active') === 'true';
  });
  const [trainingStartTime, setTrainingStartTime] = useState<string>(() => {
    const saved = localStorage.getItem('badminton_session_start');
    return saved === '15:00' || !saved ? '07:30' : saved;
  });
  const [trainingEndTime, setTrainingEndTime] = useState<string>(() => {
    const saved = localStorage.getItem('badminton_session_end');
    return saved === '17:30' || !saved ? '09:00' : saved;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
      setCurrentDayStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Training stopwatch effect
  useEffect(() => {
    let timer: any;
    if (isTrainingActive) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTrainingActive]);

  const handleStartTraining = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setIsTrainingActive(true);
    setTrainingStartTime(timeStr);
    setElapsedSeconds(0);
    localStorage.setItem('badminton_session_active', 'true');
    localStorage.setItem('badminton_session_start', timeStr);
    showToast('Latihan Dimulai! 🏸', 'success', `Waktu mulai dicatat: ${timeStr}`);
  };

  const handleStopTraining = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setIsTrainingActive(false);
    setTrainingEndTime(timeStr);
    localStorage.setItem('badminton_session_active', 'false');
    localStorage.setItem('badminton_session_end', timeStr);
    showToast('Latihan Selesai! ⏹️', 'info', `Waktu selesai dicatat: ${timeStr}`);
  };

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Today stats
  const todayIso = new Date().toISOString().split('T')[0];
  // If there are records for today, use them; otherwise use the latest recorded session for demonstration
  const distinctDates: string[] = (Array.from(new Set(attendanceRecords.map((r) => r.date))).sort()) as string[];
  const latestDate = distinctDates[distinctDates.length - 1] || todayIso;
  const isLatestToday = distinctDates.includes(todayIso);
  const activeStatsDate = isLatestToday ? todayIso : latestDate;

  const todayRecords = attendanceRecords.filter((r) => r.date === activeStatsDate);
  const hadirCount = todayRecords.filter((r) => r.status === 'Hadir').length;
  const ijinCount = todayRecords.filter((r) => r.status === 'Ijin').length;
  const alpaCount = todayRecords.filter((r) => r.status === 'Alpa').length;
  const totalRecordedToday = todayRecords.length;
  
  const todayPercentage =
    totalRecordedToday > 0 ? ((hadirCount / totalRecordedToday) * 100).toFixed(1) : '100';

  const totalStudents = students.length;
  const totalMeetings = distinctDates.length;

  // Chart data: attendance trend across recorded dates
  const chartData = distinctDates.map((dateStr: string) => {
    const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);
    const h = dayRecords.filter((r) => r.status === 'Hadir').length;
    const i = dayRecords.filter((r) => r.status === 'Ijin').length;
    const a = dayRecords.filter((r) => r.status === 'Alpa').length;
    const pct = dayRecords.length > 0 ? Number(((h / dayRecords.length) * 100).toFixed(1)) : 0;
    
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short'
    }).format(new Date(String(dateStr)));

    return {
      date: formattedDate,
      fullDate: dateStr,
      Hadir: h,
      Ijin: i,
      Alpa: a,
      Persentase: pct
    };
  });

  // Compute attendance summaries safely
  const effectiveSummaries = useMemo(() => {
    if (summaries && Array.isArray(summaries) && summaries.length > 0) return summaries;
    return calculateAttendanceSummaries();
  }, [summaries, students, attendanceRecords]);

  // Students with high Alpa (Warning filter)
  const warningStudents = (effectiveSummaries || []).filter((s) => s.alpa >= 3);
  // Top 3 Rankings
  const topRankings = (effectiveSummaries || []).slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner: Sporty Futuristic Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/80 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40">
        {/* Background Court Geometry & Glows */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Dashboard Ekstrakurikuler
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                Semester {identity.semester} • TA {identity.academicYear}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-wide uppercase">
              {identity.schoolName}
            </h2>
            <p className="text-sm sm:text-base text-emerald-300 font-medium">
              Absensi & Manajemen Prestasi Ekstrakurikuler Bulutangkis
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors"
                title="Kelola Profil & Foto Guru"
              >
                {identity.teacherPhoto ? (
                  <img
                    src={identity.teacherPhoto}
                    alt={identity.teacherName}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <span className="text-emerald-400 font-bold">Pembina:</span>
                <span className="text-white font-semibold">{identity.teacherName}</span>
                <span className="text-[11px] text-slate-400 font-mono">({identity.nipppk || identity.teacherNip})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-emerald-300">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{currentDayStr}, {currentDateStr}</span>
                <span className="text-emerald-400 font-bold ml-1">• {currentTime}</span>
              </div>
            </div>
          </div>

          {/* Live Training Session Control Widget (Section 12) */}
          <div className="bg-slate-950/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-xl min-w-[280px]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> Sesi Latihan Hari Ini
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isTrainingActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isTrainingActive ? '● Sedang Berlangsung' : 'Standby'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">⏱️ Jam Mulai</p>
                <p className="text-sm font-bold text-white font-mono">{trainingStartTime}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">⏱️ Jam Selesai</p>
                <p className="text-sm font-bold text-white font-mono">
                  {isTrainingActive ? formatElapsed(elapsedSeconds) : trainingEndTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isTrainingActive ? (
                <button
                  onClick={handleStartTraining}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶️ MULAI LATIHAN</span>
                </button>
              ) : (
                <button
                  onClick={handleStopTraining}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>⏹️ SELESAI LATIHAN</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('attendance')}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition-colors"
                title="Buka Absensi Harian"
              >
                Isi Absensi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards (Section 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* TOTAL PESERTA */}
        <div className="sports-glass-card p-4 rounded-2xl border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              👥 Total Peserta
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-heading">{totalStudents}</p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            100% Terdata Aktif
          </p>
        </div>

        {/* HADIR HARI INI */}
        <div className="sports-glass-card p-4 rounded-2xl border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              🟢 Hadir Sesi
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">{hadirCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Sesi {activeStatsDate}
          </p>
        </div>

        {/* IJIN HARI INI */}
        <div className="sports-glass-card p-4 rounded-2xl border-amber-500/20 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              🟡 Ijin Sesi
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">{ijinCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Dispensasi / Sakit</p>
        </div>

        {/* ALPA HARI INI */}
        <div className="sports-glass-card p-4 rounded-2xl border-rose-500/20 relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
              🔴 Alpa Sesi
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 font-heading">{alpaCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Tanpa Keterangan</p>
        </div>

        {/* PERSENTASE KEHADIRAN */}
        <div className="sports-glass-card p-4 rounded-2xl border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              📊 % Kehadiran
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-heading">
            {todayPercentage}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Target Sekolah &ge; 80%</p>
        </div>

        {/* TOTAL PERTEMUAN */}
        <div className="sports-glass-card p-4 rounded-2xl border-teal-500/20 relative overflow-hidden group hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
              🏸 Pertemuan
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-400 font-heading">{totalMeetings}</p>
          <p className="text-[10px] text-slate-400 mt-1">Sesi Terlaksana</p>
        </div>
      </div>

      {/* Warning Notice Banner (Section 19: Peringatan Siswa Sering Alpa) */}
      {warningStudents.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/70 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-300 text-sm sm:text-base uppercase tracking-wide flex items-center gap-1.5">
                  ⚠️ PERHATIAN: Monitoring Kehadiran Siswa
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  {warningStudents.length} Siswa
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Beberapa peserta memiliki tingkat kehadiran rendah (Alpa &ge; 3 kali) dan memerlukan pembinaan khusus.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {warningStudents.map((ws) => (
                  <span
                    key={ws.studentId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-200"
                  >
                    <span className="font-bold">{ws.name}</span> ({ws.grade}) —
                    <span className="text-rose-400 font-bold">{ws.alpa}x Alpa</span>
                    <span className="text-[10px] ml-1 px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300">
                      {ws.rankBadge}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('recap')}
            className="self-start md:self-center shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Buka Rekapitulasi</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Charts & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart (Recharts) */}
        <div className="lg:col-span-2 sports-glass-card p-5 sm:p-6 rounded-3xl border-emerald-500/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Grafik Perkembangan Kehadiran
              </h3>
              <p className="text-xs text-slate-400">
                Tren jumlah Hadir, Ijin, dan Alpa per pertemuan latihan bulutangkis
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Hadir
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ijin
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Alpa
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorIjin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAlpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#10b981',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                  }}
                />
                <Area type="monotone" dataKey="Hadir" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHadir)" />
                <Area type="monotone" dataKey="Ijin" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorIjin)" />
                <Area type="monotone" dataKey="Alpa" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorAlpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/20">
              <p className="text-slate-400">Rata-rata Hadir</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">
                {totalMeetings > 0
                  ? (chartData.reduce((acc, c) => acc + c.Hadir, 0) / totalMeetings).toFixed(1)
                  : 0}{' '}
                Siswa
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20">
              <p className="text-slate-400">Rata-rata Ijin</p>
              <p className="text-base font-bold text-amber-400 mt-0.5">
                {totalMeetings > 0
                  ? (chartData.reduce((acc, c) => acc + c.Ijin, 0) / totalMeetings).toFixed(1)
                  : 0}{' '}
                Siswa
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/20">
              <p className="text-slate-400">Rata-rata Alpa</p>
              <p className="text-base font-bold text-rose-400 mt-0.5">
                {totalMeetings > 0
                  ? (chartData.reduce((acc, c) => acc + c.Alpa, 0) / totalMeetings).toFixed(1)
                  : 0}{' '}
                Siswa
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Top 3 Rankings & Next Schedule */}
        <div className="space-y-6">
          {/* Top 3 Rankings (Section 20) */}
          <div className="sports-glass-card p-5 rounded-3xl border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                🏆 Top Ranking Kehadiran
              </h3>
              <button
                onClick={() => onNavigate('recap')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {topRankings.map((item, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const borderColors = [
                  'border-amber-500/50 bg-gradient-to-r from-amber-950/40 to-slate-900',
                  'border-slate-400/40 bg-slate-900',
                  'border-amber-700/40 bg-slate-900'
                ];

                return (
                  <div
                    key={item.studentId}
                    onClick={() => {
                      const found = students.find((s) => s.id === item.studentId);
                      if (found) onSelectStudent(found);
                    }}
                    className={`p-3 rounded-2xl border ${borderColors[idx]} flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-400 transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{medals[idx]}</span>
                      <div>
                        <p className="text-xs font-bold text-white hover:text-emerald-300">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.grade} • Absen {item.absenNo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {item.percentage}%
                      </span>
                      <p className="text-[10px] text-emerald-300/80">{item.hadir} Hadir</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Schedule Card */}
          <div className="sports-glass-card p-5 rounded-3xl border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Agenda Latihan Terdekat
              </h3>
              <button
                onClick={() => onNavigate('schedules')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Kelola Jadwal
              </button>
            </div>

            {schedules.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {schedules[0].day}, {schedules[0].date}
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {schedules[0].startTime} - {schedules[0].endTime} WITA
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{schedules[0].material}</p>
                <p className="text-[11px] text-slate-400">{schedules[0].location}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Belum ada jadwal latihan mendatang.</p>
            )}

            <button
              onClick={() => onNavigate('quick-absent')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buka Mode Absensi Cepat HP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
