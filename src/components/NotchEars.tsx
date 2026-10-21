import React from "react";

interface NotchEarsProps {
  size?: number;
  className?: string;
  fill?: string;
}

/**
 * Pixel-perfect SVG concave wings ("ears") for the Apple-style hardware notch.
 * Connects the horizontal top screen bezel smoothly into the vertical notch sides.
 */
export const NotchEarLeft: React.FC<NotchEarsProps> = ({
  size = 22,
  className = "notch-ear notch-ear-left",
  fill = "#000000"
}) => {
  return (
    <svg
      width={size}
      height={size + 6}
      viewBox={`0 -6 ${size} ${size + 6}`}
      className={className}
      style={{
        position: "absolute",
        top: -6,
        left: -size,
        width: `${size}px`,
        height: `${size + 6}px`,
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible"
      }}
      aria-hidden="true"
    >
      {/* 6px upward bleed rectangle permanently covering the bezel so zero gap can ever show */}
      <rect x="0" y="-6" width={size} height="6" fill={fill} />
      {/* Black notch fill scooped out to create concave outer curve */}
      <path
        d={`M 0,0 C ${size * 0.5525},0 ${size},${size * 0.4475} ${size},${size} L ${size},0 Z`}
        fill={fill}
      />
    </svg>
  );
};

export const NotchEarRight: React.FC<NotchEarsProps> = ({
  size = 22,
  className = "notch-ear notch-ear-right",
  fill = "#000000"
}) => {
  return (
    <svg
      width={size}
      height={size + 6}
      viewBox={`0 -6 ${size} ${size + 6}`}
      className={className}
      style={{
        position: "absolute",
        top: -6,
        right: -size,
        width: `${size}px`,
        height: `${size + 6}px`,
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible"
      }}
      aria-hidden="true"
    >
      {/* 6px upward bleed rectangle permanently covering the bezel so zero gap can ever show */}
      <rect x="0" y="-6" width={size} height="6" fill={fill} />
      {/* Black notch fill scooped out to create concave outer curve */}
      <path
        d={`M ${size},0 C ${size * 0.4475},0 0,${size * 0.4475} 0,${size} L 0,0 Z`}
        fill={fill}
      />
    </svg>
  );
};
