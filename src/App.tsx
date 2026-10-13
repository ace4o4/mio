import React, { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BatteryCharging, Bluetooth, ChevronUp,
  Disc3, GripHorizontal, Mic, Minus, Moon, Music,
  Play, Pause, SkipBack, SkipForward, Sparkles,
  Sun, Volume2, VolumeX, Wifi, X, Send, Radio
} from "lucide-react";
import type { ControlSnapshot } from "./platform/controls";
import { getControlSnapshot, setPreviewLevel, setPreviewToggle } from "./platform/controls";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow, LogicalPosition, LogicalSize, currentMonitor } from "@tauri-apps/api/window";

type ActiveTab = "controls" | "media" | "assistant";

// Apple Dynamic Island fluid spring physics
const islandSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.75
};

const microSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30
};

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("controls");
  const [isApp, setIsApp] = useState(false);
  const [state, setState] = useState<ControlSnapshot>({
    wifi: true,
    bluetooth: true,
    volume: 65,
    brightness: 75,
    battery: 88,
    charging: true
  });
  const [dnd, setDnd] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackProgress, setTrackProgress] = useState(42);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Check Tauri runtime environment
  useEffect(() => {
    try {
      const runningInTauri = isTauri();
      setIsApp(runningInTauri);
      if (runningInTauri) {
        document.documentElement.classList.add("tauri-app-env");
        document.body.classList.add("tauri-app-env");
      }
    } catch {
      setIsApp(false);
    }
  }, []);

  // Fetch initial control snapshot
  useEffect(() => {
    getControlSnapshot().then(setState);
  }, []);

  // Position and snap window to top-middle of the screen (2-3px from top line)
  const snapToTopCenter = useCallback(async (width: number, height: number, forcePosition = false) => {
    if (!isTauri()) return;
    try {
      const win = getCurrentWindow();
      const mon = await currentMonitor();
      if (mon && (!hasMoved || forcePosition)) {
        const scale = mon.scaleFactor || 1;
        const screenWidth = mon.size.width / scale;
        const targetX = Math.round((screenWidth - width) / 2);
        const targetY = 3; // 2-3px below the top bezel as requested
        await win.setPosition(new LogicalPosition(targetX, targetY));
      }
      await win.setSize(new LogicalSize(width, height));
    } catch (e) {
      console.warn("Could not set window position/size:", e);
    }
  }, [hasMoved]);

  // Handle window sizing and positioning when expanding/collapsing
  useEffect(() => {
    if (!isApp) return;
    if (isExpanded) {
      snapToTopCenter(430, 520);
    } else {
      snapToTopCenter(290, 48);
    }
  }, [isExpanded, isApp, snapToTopCenter]);

  // Initial positioning on launch
  useEffect(() => {
    if (isApp) {
      snapToTopCenter(290, 48, true);
    }
  }, [isApp, snapToTopCenter]);

  // Native window dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, [role='slider'], .no-drag")) return;
    if (isApp) {
      try {
        setHasMoved(true);
        getCurrentWindow().startDragging();
      } catch {
        // ignore
      }
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        setIsExpanded(prev => !prev);
        setActiveTab("assistant");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function toggle(key: "wifi" | "bluetooth") {
    setState(await setPreviewToggle(key, !state[key]));
  }

  async function level(key: "volume" | "brightness", value: number) {
    setState(await setPreviewLevel(key, value));
  }

  function submitPrompt(text?: string) {
    const promptText = (text || query).trim();
    if (!promptText) return;
    setReply(`MIO: Received “${promptText}”. Assistant brain connection ready.`);
    setQuery("");
  }

  function handleMinimize() {
    if (isApp) {
      try { getCurrentWindow().minimize(); } catch { /* ignore */ }
    }
  }

  function handleClose() {
    if (isApp) {
      try { getCurrentWindow().close(); } catch { /* ignore */ }
    } else {
      setIsExpanded(false);
    }
  }

  return (
    <main
      className={`island-viewport ${isApp ? "native-mode" : "preview-mode"}`}
      onPointerDown={handlePointerDown}
      ref={containerRef}
    >
      <motion.div
        layout
        transition={islandSpring}
        className={`dynamic-island ${isExpanded ? "island-expanded" : "island-compact"}`}
      >
        {/* COMPACT PILL STATE (Apple Dynamic Island Idle Pill) */}
        {!isExpanded ? (
          <motion.div
            layout
            key="compact"
            className="compact-pill-surface"
            onClick={() => setIsExpanded(true)}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            transition={microSpring}
          >
            {/* Left Item: Mascot Aura with glint */}
            <div className="pill-side pill-left">
              <span className="mascot-orb-mini">
                <Sparkles size={14} className="mascot-icon-mini" />
                <span className="mascot-pulse-ring" />
              </span>
              <span className="pill-brand-text">MIO</span>
            </div>

            {/* Center: Grip bar indicator */}
            <div className="pill-center" title="Click to expand · Drag to reposition">
              <span className="island-notch-pip" />
            </div>

            {/* Right Item: Live Activity (Equalizer or Battery) */}
            <div className="pill-side pill-right">
              {isPlaying ? (
                <div className="mini-eq-visualizer" title="Now playing: Glow · Echo">
                  <span className="eq-bar bar-1" />
                  <span className="eq-bar bar-2" />
                  <span className="eq-bar bar-3" />
                  <span className="eq-bar bar-4" />
                </div>
              ) : (
                <div className="pill-battery-badge">
                  <span>{state.battery}%</span>
                  <BatteryCharging size={13} className="battery-bolt-green" />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* EXPANDED ISLAND STATE (Apple Control Center & Widgets) */
          <motion.div
            layout
            key="expanded"
            className="expanded-island-surface"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={islandSpring}
          >
            {/* Island Header & Top Drag Region */}
            <div className="island-header" data-tauri-drag-region>
              <div className="island-brand">
                <span className="mascot-orb-expanded">
                  <Sparkles size={16} />
                  <span className="mascot-glint-subtle" />
                </span>
                <div className="brand-copy">
                  <span className="brand-title">MIO ISLAND</span>
                  <span className="brand-status">
                    <span className="live-dot" /> Living Companion
                  </span>
                </div>
              </div>

              {/* Drag Handle Notch in the center */}
              <div
                className="island-drag-notch"
                title="Drag to reposition anywhere"
                onDoubleClick={() => snapToTopCenter(430, 520, true)}
              >
                <GripHorizontal size={15} />
              </div>

              {/* Top Controls: Collapse / Min / Close */}
              <div className="window-controls no-drag">
                <button
                  className="control-icon-btn"
                  onClick={() => setIsExpanded(false)}
                  title="Collapse to pill"
                >
                  <ChevronUp size={15} />
                </button>
                {isApp && (
                  <>
                    <button
                      className="control-icon-btn"
                      onClick={handleMinimize}
                      title="Minimize"
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      className="control-icon-btn close-btn"
                      onClick={handleClose}
                      title="Close"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Segmented Capsule Tabs (Controls | Media | AI) */}
            <div className="island-tab-bar no-drag">
              <button
                className={`tab-pill ${activeTab === "controls" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("controls")}
              >
                <Radio size={13} /> Controls
              </button>
              <button
                className={`tab-pill ${activeTab === "media" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("media")}
              >
                <Music size={13} /> Media
              </button>
              <button
                className={`tab-pill ${activeTab === "assistant" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("assistant")}
              >
                <Sparkles size={13} /> MIO Core
              </button>
            </div>

            {/* TAB 1: SYSTEM CONTROLS (iOS Control Center Style) */}
            <AnimatePresence mode="wait">
              {activeTab === "controls" && (
                <motion.div
                  key="controls"
                  className="tab-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Quick Control Squircles Grid */}
                  <div className="control-grid-squircles no-drag">
                    <SquircleToggle
                      icon={<Wifi size={20} />}
                      label="Wi-Fi"
                      sublabel={state.wifi ? "Office 5GHz" : "Off"}
                      active={state.wifi}
                      accent="cyan"
                      onClick={() => toggle("wifi")}
                    />
                    <SquircleToggle
                      icon={<Bluetooth size={20} />}
                      label="Bluetooth"
                      sublabel={state.bluetooth ? "AirPods Pro" : "Off"}
                      active={state.bluetooth}
                      accent="blue"
                      onClick={() => toggle("bluetooth")}
                    />
                    <SquircleToggle
                      icon={<Moon size={20} />}
                      label="Focus / DND"
                      sublabel={dnd ? "Active" : "Off"}
                      active={dnd}
                      accent="purple"
                      onClick={() => setDnd(!dnd)}
                    />
                    <div className="squircle-card battery-squircle">
                      <div className="squircle-top">
                        <BatteryCharging size={20} className="battery-green-icon" />
                        <span className="battery-pct-badge">{state.battery}%</span>
                      </div>
                      <span className="squircle-label">Power State</span>
                      <span className="squircle-sublabel">
                        {state.charging ? "Fast Charging" : "On Battery"}
                      </span>
                    </div>
                  </div>

                  {/* Apple Control Center Horizontal Pill Sliders */}
                  <div className="capsule-sliders no-drag">
                    <AppleCapsuleSlider
                      icon={state.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      label="Volume"
                      value={state.volume}
                      onChange={val => level("volume", val)}
                    />
                    <AppleCapsuleSlider
                      icon={<Sun size={18} />}
                      label="Brightness"
                      value={state.brightness}
                      onChange={val => level("brightness", val)}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 2: MEDIA PLAYER (Inspired directly by Reference Image 2) */}
              {activeTab === "media" && (
                <motion.div
                  key="media"
                  className="tab-content media-widget-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="media-player-card no-drag">
                    <div className="media-art-cover">
                      <Disc3 size={32} className={`art-disc ${isPlaying ? "disc-spinning" : ""}`} />
                      <div className="media-art-glow" />
                    </div>

                    <div className="media-meta">
                      <div className="track-title-row">
                        <span className="track-title">Glow</span>
                        <div className="media-eq-pill">
                          <span className={`live-eq ${isPlaying ? "eq-active" : ""}`} />
                          <span className={`live-eq ${isPlaying ? "eq-active" : ""}`} />
                          <span className={`live-eq ${isPlaying ? "eq-active" : ""}`} />
                        </div>
                      </div>
                      <span className="track-artist">Echo · Ambient Waves</span>
                    </div>
                  </div>

                  {/* Progress Timeline Scrubber */}
                  <div className="media-timeline no-drag">
                    <div
                      className="scrubber-track"
                      onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                        setTrackProgress(pct);
                      }}
                    >
                      <div className="scrubber-fill" style={{ width: `${trackProgress}%` }} />
                      <div className="scrubber-thumb" style={{ left: `${trackProgress}%` }} />
                    </div>
                    <div className="timeline-labels">
                      <span>1:20</span>
                      <span>-2:15</span>
                    </div>
                  </div>

                  {/* Playback Buttons */}
                  <div className="media-buttons-row no-drag">
                    <button
                      className="media-btn secondary-btn"
                      onClick={() => setTrackProgress(0)}
                      title="Previous"
                    >
                      <SkipBack size={18} />
                    </button>
                    <button
                      className="media-btn primary-play-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                    </button>
                    <button
                      className="media-btn secondary-btn"
                      onClick={() => setTrackProgress(100)}
                      title="Next"
                    >
                      <SkipForward size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: MIO AI CORE (Apple Intelligence / Siri Holographic Glow) */}
              {activeTab === "assistant" && (
                <motion.div
                  key="assistant"
                  className="tab-content assistant-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="ai-siri-greeting">
                    <div className="ai-halo-mascot">
                      <Sparkles size={24} />
                      <div className="ai-glow-aura" />
                    </div>
                    <div className="ai-copy">
                      <span className="ai-salute">Haan bhai, bol.</span>
                      <span className="ai-subtitle">MIO companion agent listening...</span>
                    </div>
                  </div>

                  {/* Voice waveform preview */}
                  <div className="waveform-bar-container">
                    <div className={`voice-wave ${isListening ? "wave-dancing" : ""}`}>
                      <span /><span /><span /><span /><span /><span /><span /><span />
                    </div>
                  </div>

                  {/* Prompt Box */}
                  <form
                    className="ai-prompt-capsule no-drag"
                    onSubmit={e => { e.preventDefault(); submitPrompt(); }}
                  >
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Ask MIO or run system task..."
                      aria-label="Ask MIO"
                    />
                    <button
                      type="button"
                      className={`ai-mic-btn ${isListening ? "mic-on" : ""}`}
                      onClick={() => setIsListening(!isListening)}
                      title="Toggle voice"
                    >
                      <Mic size={16} />
                    </button>
                    <button
                      type="submit"
                      className="ai-send-btn"
                      title="Submit prompt"
                    >
                      <Send size={15} />
                    </button>
                  </form>

                  {/* Quick Action Suggestion Chips */}
                  <div className="ai-chips-row no-drag">
                    <button
                      type="button"
                      className="ai-chip"
                      onClick={() => submitPrompt("What's playing right now?")}
                    >
                      What's playing?
                    </button>
                    <button
                      type="button"
                      className="ai-chip"
                      onClick={() => {
                        level("volume", 0);
                        submitPrompt("Mute volume");
                      }}
                    >
                      Mute audio
                    </button>
                    <button
                      type="button"
                      className="ai-chip"
                      onClick={() => {
                        setDnd(true);
                        submitPrompt("Set Do Not Disturb");
                      }}
                    >
                      Focus mode
                    </button>
                  </div>

                  {reply && <div className="ai-reply-card">{reply}</div>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Island Bottom Footer & Snap Hint */}
            <div className="island-footer">
              <span className="shortcut-hint">
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd>
              </span>
              <button
                className="snap-btn no-drag"
                onClick={() => snapToTopCenter(430, 520, true)}
                title="Snap back to top middle of screen"
              >
                Snap Top
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// SUBCOMPONENTS
// ---------------------------------------------------------------------------

function SquircleToggle({
  icon,
  label,
  sublabel,
  active,
  accent,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  accent: "cyan" | "blue" | "purple";
  onClick: () => void;
}) {
  return (
    <button
      className={`squircle-card squircle-toggle ${active ? `active-${accent}` : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="squircle-top">
        <span className="squircle-icon">{icon}</span>
        <span className={`neon-dot ${active ? "neon-on" : ""}`} />
      </div>
      <span className="squircle-label">{label}</span>
      <span className="squircle-sublabel">{sublabel}</span>
    </button>
  );
}

function AppleCapsuleSlider({
  icon,
  label,
  value,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    onChange(pct);
  };

  return (
    <div className="capsule-slider-wrap">
      <div
        className="capsule-slider"
        ref={sliderRef}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointer(e);
        }}
        onPointerMove={e => {
          if (e.buttons === 1) handlePointer(e);
        }}
        role="slider"
        aria-valuenow={value}
        aria-label={label}
      >
        <div className="capsule-fill" style={{ width: `${value}%` }} />
        <div className="capsule-content">
          <span className="capsule-icon">{icon}</span>
          <span className="capsule-label">{label}</span>
          <span className="capsule-value">{value}%</span>
        </div>
      </div>
    </div>
  );
}
