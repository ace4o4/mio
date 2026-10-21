import React, { useState } from "react";
import { Mic, Send, X, RotateCcw, Check, AlertCircle } from "lucide-react";
import { MioMascot } from "./MioMascot";

interface AssistantSurfaceProps {
  onResetPosition?: () => void;
  onClose?: () => void;
  showHeader?: boolean;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export const AssistantSurface: React.FC<AssistantSurfaceProps> = ({
  onResetPosition,
  onClose,
  showHeader = false,
  onInputFocus,
  onInputBlur
}) => {
  const [query, setQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<string | null>(null);

  const handleSubmit = (text?: string) => {
    const input = (text || query).trim();
    if (!input) return;

    if (input.toLowerCase().includes("deploy") || input.toLowerCase().includes("delete")) {
      setPendingApproval(`Approve operation: "${input}"?`);
      setResponse(null);
    } else {
      setResponse(`MIO: Understood "${input}". Local task queued.`);
      setPendingApproval(null);
    }
    setQuery("");
  };

  const handleApprove = () => {
    setResponse("Operation confirmed and completed safely.");
    setPendingApproval(null);
  };

  const handleDeny = () => {
    setResponse("Operation cancelled.");
    setPendingApproval(null);
  };

  return (
    <div className="assistant-surface-panel no-drag">
      {/* Panel Top Header */}
      {showHeader && (
        <div className="panel-header-row">
          <div className="panel-title-group">
            <MioMascot size={20} isActive={true} />
            <span className="panel-heading">MIO Assistant</span>
          </div>

          <div className="panel-header-actions">
            {onResetPosition && (
              <button
                type="button"
                className="panel-icon-btn"
                onClick={onResetPosition}
                title="Return to top-centre of screen"
                aria-label="Return to top-centre"
              >
                <RotateCcw size={13} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                className="panel-icon-btn close-panel-btn"
                onClick={onClose}
                title="Dismiss panel (Esc)"
                aria-label="Dismiss panel"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Greeting and Status */}
      <div className="assistant-salute-box">
        <span className="assistant-salute-title">Haan bhai, bol.</span>
        <span className="assistant-salute-status">
          {isRecording ? "Listening explicitly · Click mic to stop" : "Idle companion · Ready for commands"}
        </span>
      </div>

      {/* Text Input & Voice Capsule (Focus only on deliberate click, Section 9) */}
      <form
        className="assistant-input-capsule"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder="Ask MIO or enter local action..."
          className="assistant-text-field"
          aria-label="Command query"
        />

        <button
          type="button"
          className={`assistant-action-icon-btn ${isRecording ? "mic-recording" : ""}`}
          onClick={() => setIsRecording(!isRecording)}
          title={isRecording ? "Stop voice input" : "Start explicit voice input"}
          aria-label="Toggle voice input"
        >
          <Mic size={14} />
        </button>

        <button
          type="submit"
          className="assistant-action-icon-btn send-btn"
          title="Submit command"
          aria-label="Submit command"
        >
          <Send size={13} />
        </button>
      </form>

      {/* Suggested Quick Action Chips */}
      <div className="quick-chips-row">
        <button
          type="button"
          className="quick-chip"
          onClick={() => handleSubmit("Summarize current active task")}
        >
          Task status
        </button>
        <button
          type="button"
          className="quick-chip"
          onClick={() => handleSubmit("Mute system audio")}
        >
          Mute audio
        </button>
        <button
          type="button"
          className="quick-chip"
          onClick={() => handleSubmit("Deploy local build")}
        >
          Test approval
        </button>
      </div>

      {/* Pending Approval Card (Section 6 & 7) */}
      {pendingApproval && (
        <div className="approval-card">
          <div className="approval-header">
            <AlertCircle size={15} className="approval-warning-icon" />
            <span className="approval-title">Action Approval Required</span>
          </div>
          <p className="approval-desc">{pendingApproval}</p>
          <div className="approval-actions-row">
            <button
              type="button"
              className="approval-btn approve-btn"
              onClick={handleApprove}
            >
              <Check size={12} /> Approve
            </button>
            <button
              type="button"
              className="approval-btn deny-btn"
              onClick={handleDeny}
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Response Card */}
      {response && (
        <div className="assistant-response-card">
          <span className="response-text">{response}</span>
        </div>
      )}
    </div>
  );
};
