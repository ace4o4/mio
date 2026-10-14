import React from "react";
import { Settings, X } from "lucide-react";
import { motion } from "motion/react";

interface SettingsModalProps {
  onClose: () => void;
  autohide: boolean;
  onToggleAutohide: () => void;
  wallpaper: string;
  onChangeWallpaper: (wp: string) => void;
  onSnapTop: () => void;
  isApp: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  autohide,
  onToggleAutohide,
  wallpaper,
  onChangeWallpaper,
  onSnapTop,
  isApp
}) => {
  return (
    <motion.div
      className="notch-settings-dropdown"
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.18 }}
    >
      <div className="settings-header">
        <div className="settings-title-group">
          <Settings size={14} className="settings-icon" />
          <span>Notch Settings</span>
        </div>
        <button
          type="button"
          className="settings-close-btn"
          onClick={onClose}
          title="Close settings"
        >
          <X size={14} />
        </button>
      </div>

      <div className="settings-body">
        {/* Autohide toggle */}
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Auto-collapse on Idle</span>
            <span className="setting-sub">Collapse back to minimal notch when mouse leaves</span>
          </div>
          <button
            type="button"
            className={`toggle-switch ${autohide ? "on" : "off"}`}
            onClick={onToggleAutohide}
            aria-pressed={autohide}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        {/* Wallpaper Picker for Web preview / test environment */}
        <div className="setting-row setting-column">
          <div className="setting-info">
            <span className="setting-label">Wallpaper Preview</span>
            <span className="setting-sub">Match your screen aesthetic</span>
          </div>
          <div className="wallpaper-chips-grid">
            <button
              type="button"
              className={`wallpaper-chip wp-pastel ${wallpaper === "pastel" ? "selected" : ""}`}
              onClick={() => onChangeWallpaper("pastel")}
              title="Pastel Brushstroke (from reference)"
            >
              Pastel Art
            </button>
            <button
              type="button"
              className={`wallpaper-chip wp-sonoma ${wallpaper === "sonoma" ? "selected" : ""}`}
              onClick={() => onChangeWallpaper("sonoma")}
              title="Sonoma Sky"
            >
              Sonoma
            </button>
            <button
              type="button"
              className={`wallpaper-chip wp-oled ${wallpaper === "oled" ? "selected" : ""}`}
              onClick={() => onChangeWallpaper("oled")}
              title="Dark Studio"
            >
              Dark Studio
            </button>
          </div>
        </div>

        {/* Snap & Position reset */}
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Display Snapping</span>
            <span className="setting-sub">Re-center at top of primary monitor</span>
          </div>
          <button
            type="button"
            className="re-snap-btn"
            onClick={onSnapTop}
            title="Snap to top center"
          >
            Snap Top
          </button>
        </div>
      </div>

      <div className="settings-footer">
        <span className="version-tag">
          MIO v0.1.0 · Notch Widget Architecture · {isApp ? "Native Desktop" : "Web Preview"}
        </span>
      </div>
    </motion.div>
  );
};
