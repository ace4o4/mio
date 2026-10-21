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
  size = 18,
  className = "notch-ear notch-ear-left",
  fill = "#000000"
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: -size,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: "none",
        zIndex: 5
      }}
      aria-hidden="true"
    >
      {/* Black notch fill scooped out to create concave outer curve */}
      <path
        d="M 0,0 C 11.05,0 20,8.95 20,20 L 20,0 Z"
        fill={fill}
      />
    </svg>
  );
};

export const NotchEarRight: React.FC<NotchEarsProps> = ({
  size = 18,
  className = "notch-ear notch-ear-right",
  fill = "#000000"
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      style={{
        position: "absolute",
        top: 0,
        right: -size,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: "none",
        zIndex: 5
      }}
      aria-hidden="true"
    >
      {/* Black notch fill scooped out to create concave outer curve */}
      <path
        d="M 20,0 C 8.95,0 0,8.95 0,20 L 0,0 Z"
        fill={fill}
      />
    </svg>
  );
};
