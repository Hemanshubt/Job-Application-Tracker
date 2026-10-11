import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-xl', sub: 'text-[11px]' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* Brand Emblem */}
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-600/30 ring-1 ring-white/20 transition-transform group-hover:scale-105',
          current.icon
        )}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Subtle glow highlight */}
          <circle cx="20" cy="16" r="14" fill="white" opacity="0.15" />

          {/* Top Bar of T */}
          <rect x="14" y="16" width="36" height="9" rx="4.5" fill="#ffffff" />

          {/* Stem of T */}
          <rect x="27" y="24" width="10" height="24" rx="5" fill="#ffffff" />

          {/* Upward Career Trajectory Arrow / Accent */}
          <path
            d="M44 33 L50 27 M50 27 L45 27 M50 27 L50 32"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="27" r="2.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-extrabold tracking-tight text-white leading-none',
              current.text
            )}
          >
            Trackr<span className="text-indigo-400">.</span>
          </span>
          {subtitle && (
            <span
              className={cn(
                'font-bold tracking-widest text-slate-500 uppercase mt-0.5',
                current.sub
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
