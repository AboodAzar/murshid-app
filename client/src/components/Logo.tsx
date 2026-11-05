import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <img
      src="/noback.png"
      alt="Oliver Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ imageRendering: "auto" }}
    />
  );
};

export default Logo;
