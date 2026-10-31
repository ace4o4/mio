import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  FileText,
  Flame,
  CalendarDays,
  Megaphone,
  Settings,
  Wrench,
  CheckSquare,
  Bell,
  Calendar,
  Timer,
  Home,
  Mail,
  Paperclip,
  Mic,
  X,
  Wifi,
  Bluetooth,
  BatteryCharging,
  Sun,
  Volume2,
  Moon,
  Plane,
  Camera,
  Scissors,
  Cpu,
  Play,
  Pause,
  SkipForward,
  Music,
  Lock,
  ChevronRight,
  type LucideIcon
} from "lucide-react";

export interface OptionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  column: 1 | 2;
}

const MENU_OPTIONS: OptionItem[] = [
  // Column 1
  { id: "chat", label: "Chat", icon: MessageSquare, column: 1 },
  { id: "notes", label: "Notes", icon: FileText, column: 1 },
  { id: "habits", label: "Habits", icon: Flame, column: 1 },
  { id: "this-week", label: "This week", icon: CalendarDays, column: 1 },
  { id: "feedback", label: "Feedback", icon: Megaphone, column: 1 },
  { id: "settings", label: "Settings", icon: Settings, column: 1 },
  { id: "tools", label: "Tools", icon: Wrench, column: 1 },

  // Column 2
  { id: "tasks", label: "Tasks", icon: CheckSquare, column: 2 },
  { id: "reminders", label: "Reminders", icon: Bell, column: 2 },
  { id: "today", label: "Today", icon: Calendar, column: 2 },
  { id: "focus", label: "Focus", icon: Timer, column: 2 },
  { id: "home", label: "Home", icon: Home, column: 2 },
  { id: "email", label: "Email", icon: Mail, column: 2 }
];

// Pixel-perfect 4-square grid icon matching user's screenshot
const GridIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="currentColor"
    className="mio-grid-icon"
  >
    <rect x="2" y="2" width="6.5" height="6.5" rx="2" />
    <rect x="11.5" y="2" width="6.5" height="6.5" rx="2" />
    <rect x="2" y="11.5" width="6.5" height="6.5" rx="2" />
    <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="2" />
  </svg>
);

interface MioChatBarProps {
  isOptionsOpen: boolean;
  onOptionsToggle: (open: boolean) => void;
  onInputFocusChange?: (focused: boolean) => void;
  onSubmitCommand?: (cmd: string) => void;
  onSelectOption?: (optionId: string) => void;
  isRecording?: boolean;
  onRecordingToggle?: () => void;
  onActionTrigger?: (id: string, label: string, icon: string, status: string, isConnected?: boolean) => void;
}

export const MioChatBar: React.FC<MioChatBarProps> = ({
  isOptionsOpen,
  onOptionsToggle,
  onInputFocusChange,
  onSubmitCommand,
  onSelectOption,
  isRecording = false,
  onRecordingToggle,
  onActionTrigger
}) => {
  const [query, setQuery] = useState("");
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // System Quick Controls States (matching user's Windows Quick Settings)
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [btEnabled, setBtEnabled] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [brightness, setBrightness] = useState(72);
  const [volume, setVolume] = useState(80);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<"controls" | "apps">("controls");

  // Auto focus input when options open
  useEffect(() => {
    if (isOptionsOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOptionsOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    if (onSubmitCommand) onSubmitCommand(query.trim());
    setActiveToast(`Executing: "${query.trim().slice(0, 20)}..."`);
    setTimeout(() => setActiveToast(null), 2500);
    setQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.startsWith("/") && !isOptionsOpen) {
      onOptionsToggle(true);
    }
  };

  const handleOptionClick = (option: OptionItem) => {
    if (onSelectOption) onSelectOption(option.id);
    setActiveToast(`Selected: ${option.label}`);
    setTimeout(() => setActiveToast(null), 2000);
    setQuery(`/${option.id} `);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    onInputFocusChange?.(true);
  };

  const handleBlur = () => {
    onInputFocusChange?.(false);
  };

  const col1 = MENU_OPTIONS.filter((o) => o.column === 1);
  const col2 = MENU_OPTIONS.filter((o) => o.column === 2);

  return (
    <div className="mio-chat-bar-container no-drag">
      {/* 
        Apple 3D Hard Glass Shell:
        Uses an exact border-radius transition (23px -> 24px) that PREVENTS any oval/egg distortion!
        Smooth fluid deceleration curve ([0.16, 1, 0.3, 1]) for both expand and collapse!
      */}
      <motion.div
        layout
        initial={false}
        animate={{
          borderRadius: isOptionsOpen ? 28 : 23,
          paddingTop: isOptionsOpen ? 8 : 2,
          paddingBottom: isOptionsOpen ? 18 : 2
        }}
        transition={{
          duration: 0.36,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={`mio-chat-card-shell ${isOptionsOpen ? "is-expanded" : "is-pill"}`}
      >
        {/* Header Row: Always Stable & Fluid */}
        <div className="mio-chat-header-row">
          {/* Left Toggle Button: Grid Icon / Close 'X' */}
          <button
            type="button"
            className="mio-pill-btn mio-grid-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOptionsToggle(!isOptionsOpen);
            }}
            title={isOptionsOpen ? "Close options" : "Open options"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOptionsOpen ? (
                <motion.div
                  key="x-icon"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="mio-center-icon"
                >
                  <X size={15} />
                </motion.div>
              ) : (
                <motion.div
                  key="grid-icon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="mio-center-icon"
                >
                  <GridIcon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="mio-pill-form">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Ask me anything or /"
              className="mio-pill-input"
            />
          </form>

          {/* Right Action Icons: Paperclip & Mic */}
          <div className="mio-pill-actions">
            <button
              type="button"
              className="mio-pill-btn mio-icon-btn"
              title="Attach file"
              onClick={() => {
                setActiveToast("Attach file");
                setTimeout(() => setActiveToast(null), 1500);
              }}
            >
              <Paperclip size={17} />
            </button>

            <button
              type="button"
              className={`mio-pill-btn mio-icon-btn ${isRecording ? "recording-active" : ""}`}
              title={isRecording ? "Stop voice" : "Voice input"}
              onClick={onRecordingToggle}
            >
              <Mic size={17} />
            </button>
          </div>
        </div>

        {/* Collapsible Options Body: System Controls & Tools Grid */}
        <AnimatePresence initial={false}>
          {isOptionsOpen && (
            <motion.div
              key="options-body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                height: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.22, delay: 0.06 }
              }}
              className="mio-options-collapsible-wrapper"
            >
              {/* Segmented Control Header: Quick Controls vs Tools */}
              <div className="mio-segmented-tabs">
                <button
                  type="button"
                  className={`mio-seg-tab ${activeTab === "controls" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("controls")}
                >
                  Quick Controls
                </button>
                <button
                  type="button"
                  className={`mio-seg-tab ${activeTab === "apps" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("apps")}
                >
                  Tools & Apps
                </button>
              </div>

              {activeTab === "controls" ? (
                /* 1. Quick System Control Tiles (Compact Apple Capsule Strip + Media + Utilities) */
                <div className="mio-quick-controls-deck">
                  {/* Ultra-compact 4-icon system toggles row */}
                  <div className="mio-qc-capsules-row">
                    {/* Wi-Fi Pill */}
                    <button
                      type="button"
                      className={`mio-qc-capsule ${wifiEnabled ? "is-on" : ""}`}
                      onClick={() => {
                        const next = !wifiEnabled;
                        setWifiEnabled(next);
                        onActionTrigger?.("wifi", "Wi-Fi", "wifi", next ? "VTX520_5G" : "Disconnected", next);
                        setActiveToast(next ? "Wi-Fi: VTX520_5G" : "Wi-Fi turned off");
                        setTimeout(() => setActiveToast(null), 1800);
                      }}
                      title={wifiEnabled ? "Wi-Fi: VTX520_5G (Tap to toggle)" : "Wi-Fi off"}
                    >
                      <Wifi size={14} />
                      <span className="mio-capsule-label">{wifiEnabled ? "VTX520" : "Off"}</span>
                    </button>

                    {/* Bluetooth Pill */}
                    <button
                      type="button"
                      className={`mio-qc-capsule ${btEnabled ? "is-on" : ""}`}
                      onClick={() => {
                        const next = !btEnabled;
                        setBtEnabled(next);
                        onActionTrigger?.("bluetooth", "Bluetooth", "bluetooth", next ? "Airdopes 91 Pro" : "Turned Off", next);
                        setActiveToast(next ? "Airdopes 91 Pro" : "Bluetooth off");
                        setTimeout(() => setActiveToast(null), 1800);
                      }}
                      title={btEnabled ? "Bluetooth: Airdopes 91 Pro (Tap to toggle)" : "Bluetooth off"}
                    >
                      <Bluetooth size={14} />
                      <span className="mio-capsule-label">{btEnabled ? "Airdopes" : "Off"}</span>
                    </button>

                    {/* Focus / DND Pill */}
                    <button
                      type="button"
                      className={`mio-qc-capsule ${dndEnabled ? "is-on" : ""}`}
                      onClick={() => {
                        const next = !dndEnabled;
                        setDndEnabled(next);
                        onActionTrigger?.("focus", "Focus Mode", "focus", next ? "Do Not Disturb" : "Disabled", next);
                        setActiveToast(next ? "Focus ON" : "Focus OFF");
                        setTimeout(() => setActiveToast(null), 1800);
                      }}
                      title="Focus / Do Not Disturb"
                    >
                      <Moon size={14} />
                      <span className="mio-capsule-label">Focus</span>
                    </button>

                    {/* Airplane Mode Pill */}
                    <button
                      type="button"
                      className={`mio-qc-capsule ${airplaneMode ? "is-on" : ""}`}
                      onClick={() => {
                        const next = !airplaneMode;
                        setAirplaneMode(next);
                        onActionTrigger?.("airplane", "Airplane", "airplane", next ? "Mode Enabled" : "Mode Off", next);
                        setActiveToast(next ? "Airplane ON" : "Airplane OFF");
                        setTimeout(() => setActiveToast(null), 1800);
                      }}
                      title="Airplane Mode"
                    >
                      <Plane size={14} />
                      <span className="mio-capsule-label">Airplane</span>
                    </button>
                  </div>

                  {/* Compact Media Player Widget with Organic Animated Sound Waves */}
                  <div className="mio-qc-media-strip">
                    <div className="mio-media-artwork">
                      <Music size={14} />
                    </div>
                    <div className="mio-media-meta">
                      <div className="mio-media-title-row">
                        <span className="mio-media-track">Deep Flow Session</span>
                        {isPlaying && (
                          <div className="mio-equalizer-bars">
                            <span className="mio-eq-bar bar-1" />
                            <span className="mio-eq-bar bar-2" />
                            <span className="mio-eq-bar bar-3" />
                          </div>
                        )}
                      </div>
                      <span className="mio-media-artist">Lofi Boy · Spotify</span>
                    </div>
                    <div className="mio-media-actions">
                      <button
                        type="button"
                        className="mio-media-btn"
                        onClick={() => {
                          const next = !isPlaying;
                          setIsPlaying(next);
                          onActionTrigger?.("music", "Now Playing", "music", next ? "Deep Flow Session" : "Paused");
                        }}
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                      </button>
                      <button
                        type="button"
                        className="mio-media-btn"
                        onClick={() => {
                          onActionTrigger?.("music", "Next Track", "music", "Midnight Reverie");
                          setActiveToast("Skipped track");
                          setTimeout(() => setActiveToast(null), 1500);
                        }}
                        title="Next Track"
                      >
                        <SkipForward size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Sliders: Brightness & Volume */}
                  <div className="mio-qc-sliders">
                    <div className="mio-qc-slider-row">
                      <Sun size={15} className="mio-slider-icon" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightness}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBrightness(val);
                          onActionTrigger?.("brightness", "Brightness", "brightness", `${val}%`);
                        }}
                        className="mio-slider-range"
                      />
                      <span className="mio-slider-val">{brightness}%</span>
                    </div>

                    <div className="mio-qc-slider-row">
                      <Volume2 size={15} className="mio-slider-icon" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVolume(val);
                          onActionTrigger?.("volume", "Volume", "volume", `${val}%`);
                        }}
                        className="mio-slider-range"
                      />
                      <span className="mio-slider-val">{volume}%</span>
                    </div>
                  </div>

                  {/* Quick Utility Tools (Screenshot, Lock, Performance) */}
                  <div className="mio-qc-tools-strip">
                    <button
                      type="button"
                      className="mio-qc-tool-chip"
                      onClick={() => {
                        onActionTrigger?.("snip", "Screen Capture", "snip", "Saved to Pictures");
                        setActiveToast("Screenshot saved to Pictures");
                        setTimeout(() => setActiveToast(null), 2000);
                      }}
                      title="Capture Screen"
                    >
                      <Scissors size={13} />
                      <span>Snip</span>
                    </button>

                    <button
                      type="button"
                      className="mio-qc-tool-chip"
                      onClick={() => {
                        onActionTrigger?.("stats", "System Health", "stats", "CPU 18% · RAM 58%");
                        setActiveToast("CPU: 18% · RAM: 58% · GPU: 12%");
                        setTimeout(() => setActiveToast(null), 2500);
                      }}
                      title="System Stats"
                    >
                      <Cpu size={13} />
                      <span>Stats</span>
                    </button>

                    <button
                      type="button"
                      className="mio-qc-tool-chip"
                      onClick={() => {
                        onActionTrigger?.("lock", "Lock Screen", "lock", "Workstation Locked");
                        setActiveToast("Windows Locked");
                        setTimeout(() => setActiveToast(null), 1800);
                      }}
                      title="Lock Workstation"
                    >
                      <Lock size={13} />
                      <span>Lock</span>
                    </button>

                    <div
                      className="mio-qc-battery-pill"
                      onClick={() => {
                        onActionTrigger?.("battery", "Battery", "battery", "80% · 4h 32m left");
                      }}
                    >
                      <BatteryCharging size={13} className="mio-battery-icon" />
                      <span>80%</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Tools & Apps 2-Column Grid */
                <div className="mio-options-grid">
                  {/* Column 1 */}
                  <div className="mio-options-col">
                    {col1.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="mio-option-item"
                          onClick={() => handleOptionClick(item)}
                        >
                          <Icon size={16} className="mio-option-icon" />
                          <span className="mio-option-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Column 2 */}
                  <div className="mio-options-col">
                    {col2.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="mio-option-item"
                          onClick={() => handleOptionClick(item)}
                        >
                          <Icon size={16} className="mio-option-icon" />
                          <span className="mio-option-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating status toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mio-floating-toast"
          >
            {activeToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
