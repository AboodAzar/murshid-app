import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Murshid Logo"
    >
      {/* Bulb body */}
      <circle cx="100" cy="90" r="60" fill="#3b82f6" />
      {/* Person silhouette inside bulb */}
      <path
        d="M100 55c-8 0-14.5 6.5-14.5 14.5S92 84 100 84s14.5-6.5 14.5-14.5S108 55 100 55z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M100 88c-14 0-26 8-30 20-1.5 4.5-2 9-2 13h64c0-4-.5-8.5-2-13-4-12-16-20-30-20z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Base of bulb */}
      <rect x="82" y="152" width="36" height="10" rx="3" fill="#1e3a8a" />
      <rect x="86" y="164" width="28" height="8" rx="2" fill="#1e3a8a" />
      {/* Rays */}
      <line x1="100" y1="8" x2="100" y2="24" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="100" y1="156" x2="100" y2="172" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="28" y1="90" x2="44" y2="90" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="156" y1="90" x2="172" y2="90" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="49" y1="39" x2="61" y2="51" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="139" y1="129" x2="151" y2="141" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="49" y1="141" x2="61" y2="129" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <line x1="139" y1="51" x2="151" y2="39" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
