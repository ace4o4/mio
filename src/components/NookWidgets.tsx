import React, { useState, useEffect } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Disc3,
  CheckSquare, Camera
} from "lucide-react";
import { motion } from "motion/react";

interface NookWidgetsProps {
  onOpenMirror: () => void;
}

interface Track {
  title: string;
  artist: string;
  duration: number; // in seconds
  color: string;
}

const PLAYLIST: Track[] = [
  { title: "Glow", artist: "Echo · Ambient", duration: 215, color: "linear-gradient(135deg, #3b82f6, #8b5cf6)" },
  { title: "Starboy", artist: "The Weeknd", duration: 230, color: "linear-gradient(135deg, #ef4444, #f97316)" },
  { title: "Midnight City", artist: "M83 · Hurry Up", duration: 244, color: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { title: "Solitude", artist: "Felsmann + Tiley", duration: 180, color: "linear-gradient(135deg, #10b981, #059669)" }
];

export const NookWidgets: React.FC<NookWidgetsProps> = ({
  onOpenMirror
}) => {
  // --- Media State ---
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(42);
  const activeTrack = PLAYLIST[trackIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= activeTrack.duration) {
          setTrackIndex(t => (t + 1) % PLAYLIST.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack.duration]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      setTrackIndex((trackIndex - 1 + PLAYLIST.length) % PLAYLIST.length);
      setCurrentTime(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackIndex((trackIndex + 1) % PLAYLIST.length);
    setCurrentTime(0);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // --- Calendar Date Strip State ---
  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "short" }); // e.g. "Jul" or "Oct"
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = today

  // Generate 5 surrounding days (-2, -1, 0, 1, 2)
  const surroundingDays = [-2, -1, 0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(now.getDate() + offset);
    return {
      offset,
      dayNum: d.getDate(),
      dayName: d.toLocaleString("default", { weekday: "short" }).toUpperCase(),
      dateObj: d,
      isToday: offset === 0
    };
  });

  // --- Agenda State ---
  const [agendaTasks, setAgendaTasks] = useState<string[]>([
    "Nothing for today"
  ]);
  const [agendaIndex, setAgendaIndex] = useState(0);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const handleCycleAgenda = () => {
    if (agendaTasks.length > 1) {
      setAgendaIndex((agendaIndex + 1) % agendaTasks.length);
    } else {
      setShowTaskInput(true);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const updated = agendaTasks[0] === "Nothing for today"
      ? [newTaskText.trim()]
      : [...agendaTasks, newTaskText.trim()];
    setAgendaTasks(updated);
    setAgendaIndex(updated.length - 1);
    setNewTaskText("");
    setShowTaskInput(false);
  };

  return (
    <div className="nook-widgets-row no-drag">
      {/* ------------------------------------------------------------- */}
      {/* 1. MEDIA PLAYER WIDGET (LEFT COLUMN)                          */}
      {/* ------------------------------------------------------------- */}
      <div className="nook-widget-col media-col">
        <div className="media-preview-box">
          {/* Album artwork */}
          <div
            className="album-cover-squircle"
            style={{ background: activeTrack.color }}
            title={`${activeTrack.title} · ${activeTrack.artist}`}
          >
            <Disc3
              size={20}
              className={`album-vinyl-icon ${isPlaying ? "spinning-vinyl" : ""}`}
            />
            {isPlaying && <span className="artwork-playing-glow" />}
          </div>

          {/* Track details */}
          <div className="media-info-text">
            <span className="media-title" title={activeTrack.title}>
              {activeTrack.title}
            </span>
            <span className="media-artist" title={activeTrack.artist}>
              {activeTrack.artist}
            </span>
          </div>
        </div>

        {/* Media Controls Bar */}
        <div className="media-playback-strip">
          <button
            type="button"
            className="media-ctrl-btn"
            onClick={handlePrev}
            title="Previous track"
          >
            <SkipBack size={13} fill="currentColor" />
          </button>

          <button
            type="button"
            className="media-ctrl-btn play-pause-btn"
            onClick={handleTogglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            className="media-ctrl-btn"
            onClick={handleNext}
            title="Next track"
          >
            <SkipForward size={13} fill="currentColor" />
          </button>

          {/* Live mini equalizer bars */}
          <div className="media-mini-eq" title="Live audio stream">
            <span className={`eq-bar ${isPlaying ? "bounce-1" : ""}`} />
            <span className={`eq-bar ${isPlaying ? "bounce-2" : ""}`} />
            <span className={`eq-bar ${isPlaying ? "bounce-3" : ""}`} />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CALENDAR & AGENDA WIDGET (CENTER COLUMN)                   */}
      {/* ------------------------------------------------------------- */}
      <div className="nook-widget-col calendar-col">
        {/* Month header & day strip */}
        <div className="calendar-strip-container">
          <span className="calendar-month-label">{currentMonthName}</span>

          <div className="calendar-days-row">
            {surroundingDays.map(item => {
              const isSelected = selectedDayOffset === item.offset;
              return (
                <button
                  key={item.offset}
                  type="button"
                  className={`calendar-day-item ${isSelected ? "selected-day" : ""}`}
                  onClick={() => setSelectedDayOffset(item.offset)}
                  title={`${item.dayName} ${item.dayNum}`}
                >
                  {isSelected ? (
                    <motion.div
                      layoutId="calendarActivePill"
                      className="active-day-pill"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    >
                      <span className="pill-dayname">{item.dayName}</span>
                      <span className="pill-daynum">{item.dayNum}</span>
                    </motion.div>
                  ) : (
                    <span className="inactive-daynum">{item.dayNum}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda / Event status row */}
        <div className="calendar-agenda-row">
          {showTaskInput ? (
            <form onSubmit={handleAddTask} className="quick-task-form">
              <input
                autoFocus
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="New reminder..."
                className="quick-task-input"
                onBlur={() => setShowTaskInput(false)}
              />
            </form>
          ) : (
            <div
              className="agenda-status-pill"
              onClick={handleCycleAgenda}
              title="Click to cycle agenda or add event"
            >
              <CheckSquare size={13} className="agenda-icon" />
              <span className="agenda-text">{agendaTasks[agendaIndex]}</span>
              {agendaTasks.length > 1 && (
                <span className="agenda-badge-count">{agendaTasks.length}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. QUICK ACTION WIDGET: MIRROR (RIGHT COLUMN)                 */}
      {/* ------------------------------------------------------------- */}
      <div className="nook-widget-col quick-action-col">
        <button
          type="button"
          className="mirror-widget-circle"
          onClick={onOpenMirror}
          title="Open Quick Mirror (Front Camera Check)"
        >
          <div className="mirror-circle-surface">
            <Camera size={19} className="mirror-center-icon" />
            <span className="mirror-live-pip" />
          </div>
          <span className="mirror-label-text">Mirror</span>
        </button>
      </div>
    </div>
  );
};
