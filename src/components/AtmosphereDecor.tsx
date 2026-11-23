import React from 'react';
import { ThemeMode } from '../types';

/**
 * Delicate Lavender Botanical Sprig + Crescent Moon (Dark Mode — Liquid Glass reference)
 */
export const LavenderBotanicalSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Crescent moon */}
    <path
      d="M92 22C84.8 23.4 80.2 30.3 81.6 37.5C83 44.7 89.9 49.3 97.1 47.9C99.5 47.4 101.6 46.3 103.3 44.8C96.8 45.6 90.8 41.2 89.6 34.8C88.5 29.1 91.5 23.8 96.4 21.8C94.9 21.6 93.4 21.7 92 22Z"
      fill="url(#moonGlow)"
      opacity="0.88"
    />
    {/* Tiny 4-point twinkling stars */}
    <path
      d="M36 30L37.8 35.2L43 37L37.8 38.8L36 44L34.2 38.8L29 37L34.2 35.2L36 30Z"
      fill="#E9D5FF"
      opacity="0.75"
    />
    <path
      d="M72 58L73 61L76 62L73 63L72 66L71 63L68 62L71 61L72 58Z"
      fill="#7DD3FC"
      opacity="0.7"
    />
    <circle cx="24" cy="70" r="1.4" fill="#F9A8D4" opacity="0.75" />
    <circle cx="98" cy="72" r="1.2" fill="#C4B5FD" opacity="0.7" />
    {/* Graceful lavender stems */}
    <path
      d="M58 170C57 132 54 96 42 54"
      stroke="url(#stemGrad)"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M60 170C63 136 72 104 86 68"
      stroke="url(#stemGrad)"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <path
      d="M56 170C46 144 34 124 20 102"
      stroke="url(#stemGrad)"
      strokeWidth="0.95"
      strokeLinecap="round"
      opacity="0.75"
    />
    {/* Lavender flower buds along main stem */}
    <ellipse cx="42" cy="54" rx="2.6" ry="5" transform="rotate(-16 42 54)" fill="#C084FC" opacity="0.85" />
    <ellipse cx="47" cy="64" rx="2.5" ry="4.5" transform="rotate(18 47 64)" fill="#A855F7" opacity="0.78" />
    <ellipse cx="39" cy="68" rx="2.4" ry="4.5" transform="rotate(-26 39 68)" fill="#E879F9" opacity="0.72" />
    <ellipse cx="49" cy="77" rx="2.5" ry="4.6" transform="rotate(20 49 77)" fill="#C084FC" opacity="0.76" />
    <ellipse cx="42" cy="81" rx="2.4" ry="4.4" transform="rotate(-22 42 81)" fill="#818CF8" opacity="0.72" />
    <ellipse cx="52" cy="91" rx="2.4" ry="4.3" transform="rotate(18 52 91)" fill="#D8B4FE" opacity="0.65" />
    <ellipse cx="46" cy="96" rx="2.2" ry="4" transform="rotate(-20 46 96)" fill="#A78BFA" opacity="0.62" />
    {/* Right branch buds */}
    <ellipse cx="86" cy="68" rx="2.3" ry="4.4" transform="rotate(24 86 68)" fill="#C084FC" opacity="0.8" />
    <ellipse cx="79" cy="78" rx="2.2" ry="4" transform="rotate(-14 79 78)" fill="#F472B6" opacity="0.66" />
    <ellipse cx="83" cy="85" rx="2.2" ry="4" transform="rotate(28 83 85)" fill="#A855F7" opacity="0.7" />
    <ellipse cx="74" cy="94" rx="2.1" ry="3.8" transform="rotate(-12 74 94)" fill="#93C5FD" opacity="0.6" />
    <defs>
      <linearGradient id="moonGlow" x1="82" y1="22" x2="103" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5D0FE" />
        <stop offset="1" stopColor="#93C5FD" />
      </linearGradient>
      <linearGradient id="stemGrad" x1="58" y1="170" x2="45" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4B5FD" stopOpacity="0.2" />
        <stop offset="0.55" stopColor="#DDD6FE" stopOpacity="0.65" />
        <stop offset="1" stopColor="#F5D0FE" stopOpacity="0.85" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Retro Y2K Pixel Cursor Accent (Light Mode — Dreamy Y2K reference)
 */
export const PixelCursorSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 3V19L8.5 15L11.5 21L14.5 19.5L11.5 13.5L17 13.5L4 3Z"
      fill="url(#y2kCursorFill)"
      stroke="#4F46E5"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <defs>
      <linearGradient id="y2kCursorFill" x1="4" y1="3" x2="16" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.55" stopColor="#DBEAFE" />
        <stop offset="1" stopColor="#E9D5FF" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * 4-Point Dreamy Sparkle Icon
 */
export const DreamySparkleSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Full-screen subtle atmospheric backdrop layer (pointer-events-none)
 */
export const AtmosphereBackdrop: React.FC<{ theme: ThemeMode }> = ({ theme }) => {
  if (theme === 'dark') {
    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Liquid ambient plasma orbs */}
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-[380px] h-[380px] rounded-full bg-sky-400/12 blur-[120px]" />
        <div className="absolute -bottom-28 left-1/3 w-[440px] h-[340px] rounded-full bg-pink-500/14 blur-[130px]" />
        {/* Delicate corner lavender motif (ultra-subtle so reading stays calm) */}
        <LavenderBotanicalSvg className="hidden lg:block absolute bottom-4 right-5 w-28 h-40 opacity-30 animate-float-slow" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Subtle Y2K sky grid */}
      <div className="absolute inset-0 y2k-grid-overlay opacity-70" />
      {/* Soft dreamy clouds */}
      <div className="absolute -top-16 left-1/4 w-[480px] h-[240px] rounded-full bg-white/65 blur-[80px]" />
      <div className="absolute bottom-0 right-12 w-[520px] h-[260px] rounded-full bg-white/55 blur-[90px]" />
      <div className="absolute top-1/3 -left-16 w-[340px] h-[340px] rounded-full bg-sky-300/35 blur-[95px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full bg-purple-300/30 blur-[95px]" />
      {/* Floating dreamy sparkles */}
      <DreamySparkleSvg className="hidden lg:block absolute top-16 right-16 w-5 h-5 text-white/85 animate-twinkle" />
      <DreamySparkleSvg className="hidden lg:block absolute bottom-20 right-10 w-4 h-4 text-indigo-400/50 animate-float-slow" />
    </div>
  );
};
