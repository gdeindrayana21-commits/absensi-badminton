import React, { useState } from 'react';
import { BadmintonLogo } from './BadmintonLogo';
import { SchoolIdentity, UserAccount } from '../types';
import { Lock, User, KeyRound, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { showToast } from './Toast';

interface LoginModalProps {
  identity: SchoolIdentity;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ identity, onLoginSuccess }) => {
  const [username, setUsername] = useState('pembina');
  const [password, setPassword] = useState('badminton123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Valid credentials or general teacher access
      if (
        (username.trim().toLowerCase() === 'pembina' && password === 'badminton123') ||
        (username.trim().toLowerCase() === 'admin' && password === 'admin123') ||
        (username.trim().toLowerCase() === 'gdebayu' && password === '198801222022211011') ||
        username.trim().length >= 3
      ) {
        const userObj: UserAccount = {
          username: username.trim(),
          name: identity.teacherName,
          role: 'guru_pembina',
          nip: identity.teacherNip
        };
        showToast(`Selamat datang, ${identity.teacherName}!`, 'success', 'Sistem absensi bulutangkis siap digunakan.');
        onLoginSuccess(userObj);
      } else {
        setErrorMsg('Username atau password tidak sesuai. Gunakan tombol login cepat di bawah.');
        showToast('Login gagal', 'error', 'Periksa kembali username dan password.');
      }
    }, 450);
  };

  const handleQuickLoginAsTeacher = () => {
    setUsername('gdebayu');
    setPassword('198801222022211011');
    const userObj: UserAccount = {
      username: 'gdebayu',
      name: identity.teacherName,
      role: 'guru_pembina',
      nip: identity.teacherNip
    };
    showToast(`Login berhasil sebagai Guru Pembina!`, 'success');
    onLoginSuccess(userObj);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl court-grid-pattern">
      <div className="relative w-full max-w-md bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 overflow-hidden">
        {/* Glow corner effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BadmintonLogo size="lg" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Portal Resmi Ekstrakurikuler
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
            {identity.schoolName}
          </h2>
          <p className="text-sm font-bold text-emerald-400 mt-1">
            🏸 ABSENSI EKSTRAKURIKULER BULUTANGKIS
          </p>
          <p className="text-xs text-slate-400 mt-1 italic">
            "{identity.slogan}"
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username pembina / admin"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/90 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/90 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'Memverifikasi...' : '🔐 LOGIN KE DASHBOARD'}</span>
          </button>
        </form>

        {/* Quick Login Shortcut for Teacher */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-3">Akses Cepat Guru Pembina:</p>
          <button
            type="button"
            onClick={handleQuickLoginAsTeacher}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-300">
                  {identity.teacherName}
                </p>
                <p className="text-[11px] text-slate-400">Guru Pembina (NIPPPK: {identity.teacherNip})</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
