import React from 'react';

interface JusticeLogoProps {
  className?: string;
  size?: number;
}

export const JusticeLogo: React.FC<JusticeLogoProps> = ({ className = 'w-8 h-8', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="goldJusticeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fced96" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#967417" />
        </linearGradient>
        <linearGradient id="goldPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf0a6" />
          <stop offset="100%" stopColor="#c59b27" />
        </linearGradient>
      </defs>

      {/* Central Pillar & Base */}
      <path
        d="M24 6V39"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 41H32"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M19 38H29"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Pinnacle Top Ornament */}
      <circle cx="24" cy="6" r="2.5" fill="url(#goldJusticeGrad)" />

      {/* Horizontal Beam */}
      <path
        d="M9 13.5C14 12.5 19 12 24 12C29 12 34 12.5 39 13.5"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="12" r="2" fill="url(#goldJusticeGrad)" />

      {/* Left Scale Strings & Dish */}
      <path
        d="M9 14L4 25M9 14L14 25"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M3 25C3 29.5 15 29.5 15 25Z"
        fill="url(#goldPlateGrad)"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="1.2"
      />

      {/* Right Scale Strings & Dish */}
      <path
        d="M39 14L34 25M39 14L44 25"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M33 25C33 29.5 45 29.5 45 25Z"
        fill="url(#goldPlateGrad)"
        stroke="url(#goldJusticeGrad)"
        strokeWidth="1.2"
      />
    </svg>
  );
};
