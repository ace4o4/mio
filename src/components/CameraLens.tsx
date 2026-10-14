import React from "react";

interface CameraLensProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * Ultra-realistic Apple hardware camera sensor with optical coating,
 * deep indigo glass refraction, and specular reflection glint (Image 2 reference).
 */
export const CameraLens: React.FC<CameraLensProps> = ({
  size = 20,
  className = "",
  glow = false
}) => {
  return (
    <div
      className={`camera-lens-housing ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title="FaceTime HD Camera Sensor"
      aria-hidden="true"
    >
      <div className="lens-outer-bezel">
        <div className="lens-glass-element">
          {/* Deep blue/purple optical reflection */}
          <div className="lens-optical-coating" />
          {/* Inner dark aperture circle */}
          <div className="lens-aperture-core" />
          {/* Specular pinpoint highlight glint */}
          <div className="lens-specular-pin" />
          {glow && <div className="lens-active-indicator" />}
        </div>
      </div>
    </div>
  );
};
