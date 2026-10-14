import React, { useState } from "react";
import {
  Sparkles, Mic, Send,
  Volume2, VolumeX, Sun
} from "lucide-react";
import type { ControlSnapshot } from "../platform/controls";

interface MioAssistantWidgetProps {
  state: ControlSnapshot;
  onToggle: (key: "wifi" | "bluetooth") => void;
  onLevel: (key: "volume" | "brightness", value: number) => void;
  dnd: boolean;
  onToggleDnd: () => void;
}

export const MioAssistantWidget: React.FC<MioAssistantWidgetProps> = ({
  state,
  onToggle,
  onLevel,
  dnd,
  onToggleDnd
}) => {
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (text?: string) => {
    const promptText = (text || query).trim();
    if (!promptText) return;

    // Smart simulated assistant logic
    if (promptText.toLowerCase().includes("mute")) {
      onLevel("volume", 0);
      setReply("Audio muted. Focus mode is also available.");
    } else if (promptText.toLowerCase().includes("focus") || promptText.toLowerCase().includes("dnd")) {
      onToggleDnd();
      setReply("Do Not Disturb toggled. Notifications silenced.");
    } else if (promptText.toLowerCase().includes("volume")) {
      onLevel("volume", 75);
      setReply("Volume set to 75%.");
    } else if (promptText.toLowerCase().includes("wifi")) {
      onToggle("wifi");
      setReply("Wi-Fi network state toggled.");
    } else {
      setReply(`MIO: Received “${promptText}”. Neural intent matched, executing background action.`);
    }
    setQuery("");
  };

  return (
    <div className="assistant-widget-container no-drag">
      {/* Siri / Holographic Mascot greeting */}
      <div className="assistant-header-bar">
        <div className="mascot-hologram">
          <Sparkles size={16} className="mascot-star-icon" />
          <span className="mascot-glow-ring" />
        </div>
        <div className="assistant-greeting-text">
          <span className="assistant-title">MIO Companion</span>
          <span className="assistant-status">Autonomous agent ready · listening</span>
        </div>

        {/* Live waveform */}
        <div className={`mini-voice-waveform ${isListening ? "active-listening" : ""}`}>
          <span /><span /><span /><span /><span /><span />
        </div>
      </div>

      {/* AI Prompt Input Bar */}
      <form
        className="assistant-prompt-form"
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask MIO or speak command..."
          className="assistant-input-field"
        />
        <button
          type="button"
          className={`assistant-mic-btn ${isListening ? "listening-now" : ""}`}
          onClick={() => setIsListening(!isListening)}
          title="Toggle voice listening"
        >
          <Mic size={14} />
        </button>
        <button
          type="submit"
          className="assistant-submit-btn"
          title="Send query"
        >
          <Send size={13} />
        </button>
      </form>

      {/* Prompt Suggestion Chips */}
      <div className="assistant-chips-row">
        <button
          type="button"
          className="assistant-chip"
          onClick={() => handleSubmit("Mute volume")}
        >
          Mute Audio
        </button>
        <button
          type="button"
          className="assistant-chip"
          onClick={() => handleSubmit("Toggle Focus mode")}
        >
          {dnd ? "Focus: Active" : "Focus DND"}
        </button>
        <button
          type="button"
          className="assistant-chip"
          onClick={() => handleSubmit("Check system battery health")}
        >
          Battery: {state.battery}%
        </button>
      </div>

      {reply && (
        <div className="assistant-reply-card">
          <Sparkles size={12} className="reply-sparkle" />
          <span>{reply}</span>
        </div>
      )}

      {/* Compact Quick Sliders */}
      <div className="assistant-sliders-row">
        <div className="mini-slider-pill">
          {state.volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
          <input
            type="range"
            min="0"
            max="100"
            value={state.volume}
            onChange={e => onLevel("volume", Number(e.target.value))}
            className="slider-input"
          />
          <span className="slider-num">{state.volume}%</span>
        </div>

        <div className="mini-slider-pill">
          <Sun size={13} />
          <input
            type="range"
            min="0"
            max="100"
            value={state.brightness}
            onChange={e => onLevel("brightness", Number(e.target.value))}
            className="slider-input"
          />
          <span className="slider-num">{state.brightness}%</span>
        </div>
      </div>
    </div>
  );
};
