import React from 'react';

export const BadmintonLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 p-2 shadow-lg shadow-emerald-500/10 ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      >
        {/* Futuristic Badminton Racket Head */}
        <ellipse cx="28" cy="18" rx="14" ry="12" stroke="currentColor" strokeWidth="2.2" className="text-emerald-400" />
        {/* Racket Strings */}
        <path d="M20 10V26M24 7V29M28 6V30M32 7V29M36 10V26" stroke="currentColor" strokeWidth="0.9" opacity="0.6" strokeDasharray="1 1" />
        <path d="M16 14H40M14 18H42M16 22H40" stroke="currentColor" strokeWidth="0.9" opacity="0.6" strokeDasharray="1 1" />
        
        {/* Shaft & Handle */}
        <path d="M20 28L7 41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 38L6 42" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />

        {/* Futuristic Flying Shuttlecock */}
        <g transform="translate(18, 12) scale(0.65)">
          <path d="M12 20L20 8L28 20" stroke="#38bdf8" strokeWidth="2" fill="rgba(56, 189, 248, 0.2)" />
          <path d="M14 16H26" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M16 12H24" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="20" cy="23" r="3.5" fill="#10b981" stroke="#34d399" strokeWidth="1" />
        </g>

        {/* Speed Energy Streak */}
        <path d="M38 6L44 4M42 12L46 11" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
      {/* Glow dot */}
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
    </div>
  );
};
