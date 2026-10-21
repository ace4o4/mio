import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NotchEarLeft, NotchEarRight } from "./NotchEars";
import { MioMascot } from "./MioMascot";
import { Sparkles, Mic, Send, X, Terminal, CheckCircle2 } from "lucide-react";

export interface AgentActivity {
  subtitle: string;
  title: string;
  iconType?: "file" | "terminal" | "sparkles" | "success";
  statusColor?: string;
}

interface DynamicNotchProps {
  activity: AgentActivity;
  isExpanded: boolean;
  onOpenPrompt?: () => void;
  onClosePrompt?: () => void;
  onSubmitCommand?: (cmd: string) => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export const DynamicNotch: React.FC<DynamicNotchProps> = ({
  activity,
  isExpanded,
  onOpenPrompt,
  onClosePrompt,
  onSubmitCommand,
  onInputFocus,
  onInputBlur
}) => {
  const [showInput, setShowInput] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    if (onSubmitCommand) onSubmitCommand(prompt.trim());
    setPrompt("");
    setShowInput(false);
    if (onClosePrompt) onClosePrompt();
  };

  const handleToggleInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !showInput;
    setShowInput(next);
    if (next && onOpenPrompt) onOpenPrompt();
    if (!next && onClosePrompt) onClosePrompt();
  };

  return (
    <div className="dynamic-notch-shell no-drag">
      {/* Concave Ears (Connecting Bezel to Notch smoothly) */}
      <NotchEarLeft size={20} fill="#000000" />
      <NotchEarRight size={20} fill="#000000" />

      {/* Main Notch Body - Expands Dynamically According to Content */}
      <div className="dynamic-notch-content">
        <AnimatePresence mode="wait">
          {!showInput ? (
            /* ============================================================ */
            /* 1. AGENT ACTIVITY VIEW (Exact Match for User's Reference Image) */
            /* ============================================================ */
            <motion.div
              key="activity-view"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="notch-activity-row"
              onClick={handleToggleInput}
              title="MIO Autonomous Workflow · Click to enter prompt"
            >
              {/* Stacked Activity Info */}
              <div className="notch-text-stack">
                {/* Top Subtitle line (e.g. "Read tooltip.tsx 63 lines") */}
                <span className="notch-subtitle-line">
                  {activity.subtitle}
                </span>

                {/* Primary Title with Activity Icon (e.g. "Reading input.tsx") */}
                <div className="notch-primary-line">
                  <span
                    className="notch-activity-glow-dot"
                    style={{
                      background: activity.statusColor || "#FF9F43"
                    }}
                  />
                  <span className="notch-title-text">{activity.title}</span>
                </div>
              </div>

              {/* Subtle Mascot / Expansion Pill trigger on right */}
              <div
                className="notch-mascot-pill"
                onClick={handleToggleInput}
                title="Open Command Input"
              >
                <MioMascot size={18} isGlancing={isExpanded} />
              </div>
            </motion.div>
          ) : (
            /* ============================================================ */
            /* 2. EXPANDED PROMPT INPUT (Fits snuggly to interactive bar)     */
            /* ============================================================ */
            <motion.div
              key="input-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="notch-input-row"
            >
              <form onSubmit={handleSubmit} className="notch-prompt-form">
                <span className="notch-form-sparkle">
                  <Sparkles size={14} className="sparkle-violet" />
                </span>

                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="Ask MIO or run workflow..."
                  className="notch-text-input"
                  autoFocus
                />

                <button
                  type="button"
                  className={`notch-action-btn ${isRecording ? "recording" : ""}`}
                  onClick={() => setIsRecording(!isRecording)}
                  title={isRecording ? "Stop voice" : "Voice command"}
                >
                  <Mic size={13} />
                </button>

                <button
                  type="submit"
                  className="notch-action-btn send-action"
                  title="Submit instruction"
                >
                  <Send size={12} />
                </button>

                <button
                  type="button"
                  className="notch-action-btn close-action"
                  onClick={handleToggleInput}
                  title="Close input"
                >
                  <X size={13} />
                </button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="notch-chips-bar">
                <button
                  type="button"
                  className="notch-chip"
                  onClick={() => {
                    setPrompt("Read tooltip.tsx lines 1-63");
                  }}
                >
                  <Terminal size={10} />
                  <span>Inspect tooltip</span>
                </button>
                <button
                  type="button"
                  className="notch-chip"
                  onClick={() => {
                    setPrompt("Run test build");
                  }}
                >
                  <CheckCircle2 size={10} />
                  <span>Run build</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Peek Indicator Dot when tucked away (90% hidden) */}
      <div className="notch-tuck-chin-glint" />
    </div>
  );
};
