import React, { useState } from "react";

interface MioMascotProps {
  size?: number;
  isGlancing?: boolean;
  isActive?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * MIO Expressive Mascot (Section 4 & Section 6)
 * A restrained, minimal vector companion with subtle gaze reactions and calm expressions.
 * Strictly avoids loud persistent glows or distracting looping particles.
 */
export const MioMascot: React.FC<MioMascotProps> = ({
  size = 22,
  isGlancing = false,
  isActive = false,
  className = "",
  onClick
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 240);
    if (onClick) onClick(e);
  };

  return (
    <div
      className={`mio-mascot-wrapper ${isActive ? "mascot-active" : ""} ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="MIO Companion (Click to open Assistant)"
      aria-label="MIO Companion"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className="mio-mascot-svg"
      >
        {/* Subtle radial depth surface */}
        <defs>
          <linearGradient id="mascotSurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B1B22" />
            <stop offset="100%" stopColor="#050507" />
          </linearGradient>
          <linearGradient id="mascotActiveSurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2438" />
            <stop offset="100%" stopColor="#111116" />
          </linearGradient>
        </defs>

        {/* Pebble Body Squircle - Pure minimal, borderless */}
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="10"
          fill={isActive ? "url(#mascotActiveSurface)" : "url(#mascotSurface)"}
        />

        {/* Expressive Eyes */}
        <g
          className="mascot-eyes"
          transform={isGlancing ? "translate(1.5, 0)" : "translate(0, 0)"}
          style={{ transition: "transform 0.15s ease-out" }}
        >
          {isBlinking ? (
            <>
              {/* Blink lines */}
              <line x1="9" y1="16" x2="13" y2="16" stroke="#F5F5F7" strokeWidth="2" strokeLinecap="round" />
              <line x1="19" y1="16" x2="23" y2="16" stroke="#F5F5F7" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left Eye */}
              <circle cx="11" cy="15.5" r="2.2" fill="#F5F5F7" />
              <circle cx="11.8" cy="14.8" r="0.8" fill="#FFFFFF" />

              {/* Right Eye */}
              <circle cx="21" cy="15.5" r="2.2" fill="#F5F5F7" />
              <circle cx="21.8" cy="14.8" r="0.8" fill="#FFFFFF" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
