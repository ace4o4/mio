import React from "react";
import {
  Wifi, Bluetooth, BatteryCharging, Moon, Sun,
  Volume2, VolumeX, Play, Pause, SkipForward,
  RotateCcw, X, Radio
} from "lucide-react";
import type { ControlSnapshot } from "../platform/controls";

interface ControlCenterSurfaceProps {
  state: ControlSnapshot;
  onToggle: (key: "wifi" | "bluetooth") => void;
  onLevel: (key: "volume" | "brightness", value: number) => void;
  dnd: boolean;
  onToggleDnd: () => void;
  onResetPosition: () => void;
  onClose: () => void;
}

export const ControlCenterSurface: React.FC<ControlCenterSurfaceProps> = ({
  state,
  onToggle,
  onLevel,
  dnd,
  onToggleDnd,
  onResetPosition,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = React.useState(true);

  return (
    <div className="control-center-panel no-drag">
      {/* Panel Top Header */}
      <div className="panel-header-row">
        <div className="panel-title-group">
          <span className="panel-badge-pip" />
          <span className="panel-heading">Control Center</span>
        </div>

        <div className="panel-header-actions">
          <button
            type="button"
            className="panel-icon-btn"
            onClick={onResetPosition}
            title="Return to top-centre of screen"
            aria-label="Return to top-centre"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            className="panel-icon-btn close-panel-btn"
            onClick={onClose}
            title="Dismiss panel (Esc)"
            aria-label="Dismiss panel"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Primary 4-Tile Grid (Wi-Fi, Bluetooth, Battery, Focus) */}
      <div className="controls-tile-grid">
        {/* Wi-Fi */}
        <button
          type="button"
          className={`control-tile ${state.wifi ? "tile-active-blue" : ""}`}
          onClick={() => onToggle("wifi")}
          aria-pressed={state.wifi}
        >
          <div className="tile-top-row">
            <Wifi size={17} />
            <span className={`status-dot ${state.wifi ? "status-on" : ""}`} />
          </div>
          <span className="tile-label">Wi-Fi</span>
          <span className="tile-sublabel">{state.wifi ? "Connected" : "Off"}</span>
        </button>

        {/* Bluetooth */}
        <button
          type="button"
          className={`control-tile ${state.bluetooth ? "tile-active-blue" : ""}`}
          onClick={() => onToggle("bluetooth")}
          aria-pressed={state.bluetooth}
        >
          <div className="tile-top-row">
            <Bluetooth size={17} />
            <span className={`status-dot ${state.bluetooth ? "status-on" : ""}`} />
          </div>
          <span className="tile-label">Bluetooth</span>
          <span className="tile-sublabel">{state.bluetooth ? "On" : "Off"}</span>
        </button>

        {/* Focus / DND */}
        <button
          type="button"
          className={`control-tile ${dnd ? "tile-active-violet" : ""}`}
          onClick={onToggleDnd}
          aria-pressed={dnd}
        >
          <div className="tile-top-row">
            <Moon size={17} />
            <span className={`status-dot ${dnd ? "status-violet" : ""}`} />
          </div>
          <span className="tile-label">Focus Mode</span>
          <span className="tile-sublabel">{dnd ? "Silenced" : "Inactive"}</span>
        </button>

        {/* Battery Health */}
        <div className="control-tile static-tile">
          <div className="tile-top-row">
            <BatteryCharging size={17} className="battery-green-icon" />
            <span className="battery-num-tag">{state.battery}%</span>
          </div>
          <span className="tile-label">Power State</span>
          <span className="tile-sublabel">{state.charging ? "Fast Charging" : "Battery"}</span>
        </div>
      </div>

      {/* Sliders: Sound & Brightness */}
      <div className="sliders-stack">
        {/* Sound Volume Slider */}
        <div className="slider-capsule">
          <button
            type="button"
            className="slider-mute-btn"
            onClick={() => onLevel("volume", state.volume === 0 ? 65 : 0)}
            title={state.volume === 0 ? "Unmute" : "Mute"}
          >
            {state.volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <div className="slider-track-box">
            <input
              type="range"
              min="0"
              max="100"
              value={state.volume}
              onChange={(e) => onLevel("volume", Number(e.target.value))}
              className="range-input"
              aria-label="System volume"
            />
            <div className="range-fill" style={{ width: `${state.volume}%` }} />
          </div>
          <span className="slider-value-display">{state.volume}%</span>
        </div>

        {/* Display Brightness Slider */}
        <div className="slider-capsule">
          <div className="slider-icon-indicator">
            <Sun size={15} />
          </div>
          <div className="slider-track-box">
            <input
              type="range"
              min="0"
              max="100"
              value={state.brightness}
              onChange={(e) => onLevel("brightness", Number(e.target.value))}
              className="range-input"
              aria-label="Display brightness"
            />
            <div className="range-fill" style={{ width: `${state.brightness}%` }} />
          </div>
          <span className="slider-value-display">{state.brightness}%</span>
        </div>
      </div>

      {/* Compact Media Strip */}
      <div className="compact-media-strip">
        <div className="media-thumbnail">
          <Radio size={14} className="media-note-icon" />
        </div>
        <div className="media-meta-inline">
          <span className="media-track-name">Solitude</span>
          <span className="media-artist-name">Felsmann + Tiley</span>
        </div>
        <div className="media-controls-inline">
          <button
            type="button"
            className="media-inline-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          </button>
          <button
            type="button"
            className="media-inline-btn"
            title="Next track"
          >
            <SkipForward size={13} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
