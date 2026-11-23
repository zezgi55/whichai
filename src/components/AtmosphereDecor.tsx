import React from 'react';
import { ThemeMode } from '../types';

export const RetroCloudSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-10' }) => (
  <svg viewBox="0 0 84 48" fill="none" className={className} aria-hidden="true">
    <path
      d="M20 40H65C72.2 40 78 34.4 78 27.5C78 21.1 73 15.8 66.6 15.1C64.4 8.7 58.3 4 51 4C43.1 4 36.5 9.5 34.9 16.9C33.4 16.3 31.7 16 30 16C22.8 16 17 21.8 17 29C17 29.4 17 29.7 17.1 30.1C12.5 30.8 9 34.7 9 39.5C9 39.7 9 39.8 9 40H20Z"
      className="fill-white dark:fill-[#2b3566] stroke-[#2c3b68] dark:stroke-[#8ea1da]"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const RetroCrescentSvg: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
    <path
      d="M27.5 29.5C21.2 31.3 14.5 27.7 12.7 21.4C10.9 15.1 14.5 8.4 20.8 6.6C22.2 6.2 23.6 6.1 25 6.2C20.2 8.2 17.8 13.7 19.3 18.9C20.8 24.1 26.2 27.1 31.4 25.8C30.3 27.5 29 28.9 27.5 29.5Z"
      className="fill-[#fde68a] dark:fill-[#fef08a] stroke-[#2c3b68] dark:stroke-[#a5b4fc]"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const RetroStarSvg: React.FC<{ className?: string; pinkAccent?: boolean }> = ({
  className = 'w-5 h-5',
  pinkAccent = false,
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.5L14.5 9.2L21.5 12L14.5 14.8L12 21.5L9.5 14.8L2.5 12L9.5 9.2L12 2.5Z"
      className={
        pinkAccent
          ? 'fill-[#f9a8d4] stroke-[#2c3b68] dark:fill-[#f472b6] dark:stroke-[#eef2ff]'
          : 'fill-[#fef08a] stroke-[#2c3b68] dark:fill-[#dbeafe] dark:stroke-[#93c5fd]'
      }
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const RetroFolderIcon: React.FC<{ className?: string; accent?: boolean }> = ({
  className = 'w-4 h-4',
  accent = false,
}) => (
  <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M2 4.5C2 3.4 2.9 2.5 4 2.5H9.2L11.2 5H20C21.1 5 22 5.9 22 7V16C22 17.1 21.1 18 20 18H4C2.9 18 2 17.1 2 16V4.5Z"
      className={
        accent
          ? 'fill-[#f9a8d4] dark:fill-[#f472b6] stroke-[#2c3b68] dark:stroke-[#eef2ff]'
          : 'fill-[#c7d8ff] dark:fill-[#495b9e] stroke-[#2c3b68] dark:stroke-[#c7d2fe]'
      }
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 7.5H21.5"
      className="stroke-[#2c3b68] dark:stroke-[#eef2ff]"
      strokeWidth="1.4"
    />
  </svg>
);

export const RetroNoteIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 22" fill="none" className={className} aria-hidden="true">
    <rect
      x="2.5"
      y="2.5"
      width="15"
      height="17"
      rx="2"
      className="fill-white dark:fill-[#26315e] stroke-[#2c3b68] dark:stroke-[#c7d2fe]"
      strokeWidth="1.6"
    />
    <line x1="6" y1="7.5" x2="14" y2="7.5" className="stroke-[#6878a3] dark:stroke-[#9cb0f0]" strokeWidth="1.4" />
    <line x1="6" y1="11.5" x2="14" y2="11.5" className="stroke-[#6878a3] dark:stroke-[#9cb0f0]" strokeWidth="1.4" />
    <line x1="6" y1="15.5" x2="11" y2="15.5" className="stroke-[#f472b6]" strokeWidth="1.5" />
  </svg>
);

export const RetroWindowControls: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <div className="flex items-center gap-1 shrink-0">
    <span className="retro-win-ctrl select-none" aria-hidden="true">
      _
    </span>
    <span className="retro-win-ctrl select-none" aria-hidden="true">
      □
    </span>
    {onClose ? (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="retro-win-ctrl hover:bg-[#fce7f3] hover:text-[#be185d] dark:hover:bg-[#f472b6]/30 cursor-pointer"
      >
        ×
      </button>
    ) : (
      <span className="retro-win-ctrl select-none" aria-hidden="true">
        ×
      </span>
    )}
  </div>
);

/**
 * Cozy Retro Desktop Backdrop Layer (Clouds, Stars, Crescent Moon)
 * Kept gentle and away from the center reading column.
 */
export const AtmosphereBackdrop: React.FC<{ theme: ThemeMode }> = ({ theme }) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {theme === 'light' ? (
        <>
          <RetroCloudSvg className="hidden lg:block absolute top-14 right-10 w-24 h-14 opacity-85 animate-float-gentle" />
          <RetroCloudSvg className="hidden xl:block absolute bottom-20 right-16 w-20 h-12 opacity-75" />
          <RetroStarSvg className="hidden lg:block absolute top-28 right-44 w-5 h-5 animate-star-blink" />
          <RetroStarSvg pinkAccent className="hidden lg:block absolute bottom-32 right-8 w-4 h-4 animate-star-blink" />
        </>
      ) : (
        <>
          <RetroCrescentSvg className="hidden lg:block absolute top-16 right-10 w-10 h-10 opacity-90 animate-float-gentle" />
          <RetroStarSvg className="hidden lg:block absolute top-28 right-24 w-4 h-4 animate-star-blink" />
          <RetroStarSvg pinkAccent className="hidden lg:block absolute top-14 right-32 w-3.5 h-3.5 animate-star-blink" />
          <RetroStarSvg className="hidden xl:block absolute bottom-24 right-12 w-4 h-4 opacity-80" />
          <RetroCloudSvg className="hidden xl:block absolute bottom-10 right-24 w-20 h-12 opacity-60" />
        </>
      )}
    </div>
  );
};
