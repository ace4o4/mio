import React from "react";
import { CameraLens } from "./CameraLens";

interface IdlePillProps {
  onExpand: () => void;
  isMusicPlaying?: boolean;
}

/**
 * Exact replica of Image 2:
 * Minimal OLED black pill with hardware camera sensor & lens glint.
 */
export const IdlePill: React.FC<IdlePillProps> = ({
  onExpand,
  isMusicPlaying = true
}) => {
  return (
    <div
      className="idle-pill-surface"
      onClick={onExpand}
      title="MIO Island · Click or hover to expand"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand();
        }
      }}
    >
      {/* Left side: Minimal activity glint or subtle music waveform */}
      <div className="idle-pill-left">
        {isMusicPlaying ? (
          <div className="idle-mini-music-indicator" title="Music Playing">
            <span className="idle-eq-bar bar-1" />
            <span className="idle-eq-bar bar-2" />
            <span className="idle-eq-bar bar-3" />
          </div>
        ) : (
          <div className="idle-stealth-notch-space" />
        )}
      </div>

      {/* Center: Stealth black expanse */}
      <div className="idle-pill-center">
        <span className="idle-droplet-glow" />
      </div>

      {/* Right side: Hardware Camera Sensor (Exact match for Image 2) */}
      <div className="idle-pill-right">
        <CameraLens size={19} />
      </div>
    </div>
  );
};
