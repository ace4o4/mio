import React, { useState, useEffect, useRef } from "react";
import {
  Play, Pause, SkipBack, SkipForward,
  Airplay, Check, Volume2, Sliders, Sparkles, X
} from "lucide-react";

interface MusicIslandProps {
  onSwitchToControls?: () => void;
  onSwitchToAssistant?: () => void;
  onClose?: () => void;
  showHeader?: boolean;
}

export const MusicIsland: React.FC<MusicIslandProps> = ({
  onSwitchToControls,
  onSwitchToAssistant,
  onClose,
  showHeader = false
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  // Match Image 2: 1:50 elapsed, -1:51 remaining (total 221 seconds)
  const [currentTime, setCurrentTime] = useState(110);
  const duration = 221;
  const [showAirplay, setShowAirplay] = useState(false);
  const [audioDevice, setAudioDevice] = useState("MacBook Pro Speakers");
  const [isScrubbing, setIsScrubbing] = useState(false);

  const scrubberRef = useRef<HTMLDivElement>(null);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || isScrubbing) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) return 0;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, isScrubbing]);

  // Format seconds to M:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Format remaining time with minus sign: -M:SS (matches Image 2: -1:51)
  const formatRemainingTime = (current: number, total: number) => {
    const diff = Math.max(0, total - current);
    const m = Math.floor(diff / 60);
    const s = Math.floor(diff % 60);
    return `-${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Interactive scrubber
  const handleScrub = (clientX: number) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(Math.round(ratio * duration));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleScrub(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      handleScrub(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  return (
    <div className="music-island-exclusive no-drag">
      {/* Top Subtle Switcher Bar (Quickly toggle to Control Center or MIO) */}
      {showHeader && (
        <div className="music-island-top-bar">
          <div className="music-island-brand-tag">
            <span className="island-active-dot" />
            <span>Now Playing</span>
          </div>

          <div className="music-island-actions">
            {onSwitchToControls && (
              <button
                type="button"
                className="island-subtle-switch-btn"
                onClick={onSwitchToControls}
                title="Switch to Control Center"
              >
                <Sliders size={12} />
                <span>Controls</span>
              </button>
            )}
            {onSwitchToAssistant && (
              <button
                type="button"
                className="island-subtle-switch-btn"
                onClick={onSwitchToAssistant}
                title="Open MIO Assistant"
              >
                <Sparkles size={12} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                className="island-subtle-switch-btn close-btn"
                onClick={onClose}
                title="Collapse (Esc)"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROW 1: STEVE JOBS ALBUM COVER + TITLE + LIVE WAVEFORM         */}
      {/* ------------------------------------------------------------- */}
      <div className="music-row-media">
        {/* Steve Jobs Album Artwork (Exact match for Image 2) */}
        <div className="jobs-cover-art" title="Steve Jobs by Walter Isaacson">
          <svg viewBox="0 0 100 100" className="jobs-cover-svg">
            <rect width="100" height="100" rx="10" fill="#f8fafc" />
            {/* Silhouette head */}
            <path
              d="M 33 32 C 33 16, 67 16, 67 32 C 67 44, 63 56, 50 62 C 37 56, 33 44, 33 32 Z"
              fill="#18181b"
            />
            <path
              d="M 36 34 C 36 20, 64 20, 64 34 C 64 42, 60 52, 50 56 C 40 52, 36 42, 36 34 Z"
              fill="#e4e4e7"
            />
            {/* Glasses */}
            <circle cx="43" cy="35" r="5.5" fill="none" stroke="#09090b" strokeWidth="2" />
            <circle cx="57" cy="35" r="5.5" fill="none" stroke="#09090b" strokeWidth="2" />
            <line x1="48.5" y1="35" x2="51.5" y2="35" stroke="#09090b" strokeWidth="2" />
            <circle cx="43" cy="35" r="1.6" fill="#09090b" />
            <circle cx="57" cy="35" r="1.6" fill="#09090b" />
            {/* Beard & Mustache */}
            <path
              d="M 40 44 C 45 43, 55 43, 60 44 C 58 54, 52 57, 50 57 C 48 57, 42 54, 40 44 Z"
              fill="#71717a"
            />
            {/* Black Turtleneck */}
            <path
              d="M 22 72 C 26 62, 38 60, 50 60 C 62 60, 74 62, 78 72 L 88 100 L 12 100 Z"
              fill="#09090b"
            />
            {/* Hand on chin */}
            <path
              d="M 43 54 C 43 50, 48 48, 54 50 C 58 52, 61 58, 59 64 C 55 69, 45 66, 43 59 Z"
              fill="#f1f5f9"
              stroke="#09090b"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Track Title & Author (Matches Image 2) */}
        <div className="music-details-text">
          <span className="music-main-title">Steve Jobs</span>
          <span className="music-sub-author">Walter Isaacson</span>
        </div>

        {/* Live Audio Equalizer Waveform Bars (Matches Image 2 right) */}
        <div className="music-live-eq" title="Audio Waveform">
          <span className={`eq-bar-tall ${isPlaying ? "bounce-bar-1" : "paused-bar"}`} />
          <span className={`eq-bar-tall ${isPlaying ? "bounce-bar-2" : "paused-bar"}`} />
          <span className={`eq-bar-tall ${isPlaying ? "bounce-bar-3" : "paused-bar"}`} />
          <span className={`eq-bar-tall ${isPlaying ? "bounce-bar-4" : "paused-bar"}`} />
          <span className={`eq-bar-tall ${isPlaying ? "bounce-bar-5" : "paused-bar"}`} />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 2: TIME + MINIMAL SCRUBBER BAR (Matches Image 2)          */}
      {/* ------------------------------------------------------------- */}
      <div className="music-row-scrubber">
        <span className="scrub-time scrub-elapsed">{formatTime(currentTime)}</span>

        <div
          className="scrub-track-touch-area"
          ref={scrubberRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="slider"
          aria-valuenow={currentTime}
          aria-valuemax={duration}
          aria-valuemin={0}
          aria-label="Seek timeline"
        >
          <div className="scrub-track-rail">
            <div
              className="scrub-track-filled"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className={`scrub-thumb-indicator ${isScrubbing ? "scrubbing-active" : ""}`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        <span className="scrub-time scrub-remaining">
          {formatRemainingTime(currentTime, duration)}
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 3: CONTROLS & AIRPLAY (Matches Image 2 bottom)           */}
      {/* ------------------------------------------------------------- */}
      <div className="music-row-controls">
        {/* Centered Transport Buttons */}
        <div className="transport-center-cluster">
          <button
            type="button"
            className="transport-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentTime(0);
            }}
            title="Previous"
            aria-label="Previous"
          >
            <SkipBack size={21} fill="currentColor" strokeWidth={0} />
          </button>

          <button
            type="button"
            className="transport-icon-btn play-pause-master"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={25} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={25} fill="currentColor" strokeWidth={0} />
            )}
          </button>

          <button
            type="button"
            className="transport-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentTime(0);
            }}
            title="Next"
            aria-label="Next"
          >
            <SkipForward size={21} fill="currentColor" strokeWidth={0} />
          </button>
        </div>

        {/* AirPlay Icon (Matches Image 2 far right) */}
        <div className="airplay-icon-cluster">
          <button
            type="button"
            className={`airplay-trigger-btn ${showAirplay ? "airplay-open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowAirplay(!showAirplay);
            }}
            title="Audio Output Device (AirPlay)"
            aria-label="Audio Output Device"
          >
            <Airplay size={18} strokeWidth={2} />
          </button>

          {/* AirPlay Output Selector Popover */}
          {showAirplay && (
            <div className="airplay-sheet-dropdown">
              <span className="airplay-sheet-title">Speaker & Output</span>
              {["MacBook Pro Speakers", "AirPods Pro", "Studio Display"].map((dev) => (
                <button
                  key={dev}
                  type="button"
                  className={`airplay-sheet-row ${audioDevice === dev ? "device-active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioDevice(dev);
                    setShowAirplay(false);
                  }}
                >
                  <Volume2 size={13} />
                  <span>{dev}</span>
                  {audioDevice === dev && <Check size={13} className="check-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
