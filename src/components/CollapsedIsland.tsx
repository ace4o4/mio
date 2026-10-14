import React, { useState, useRef } from "react";
import { MioMascot } from "./MioMascot";

interface CollapsedIslandProps {
  onOpenAssistant: () => void;
  onOpenMusic: () => void;
  onInitiateDrag: () => void;
  onFinalizeDrag: () => void;
  statusText?: string;
  isMusicPlaying?: boolean;
}

const DRAG_THRESHOLD = 6; // Section 3: 5-7 CSS pixels

export const CollapsedIsland: React.FC<CollapsedIslandProps> = ({
  onOpenAssistant,
  onOpenMusic,
  onInitiateDrag,
  onFinalizeDrag,
  statusText = "MIO",
  isMusicPlaying = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const startCoords = useRef<{ x: number; y: number } | null>(null);
  const dragTriggered = useRef(false);

  // Pointer Down on the non-interactive drag / body zone
  const handlePointerDown = (e: React.PointerEvent) => {
    // Exclude mascot or interactive buttons
    const target = e.target as HTMLElement;
    if (target.closest(".no-drag-target, button, input")) return;

    startCoords.current = { x: e.clientX, y: e.clientY };
    dragTriggered.current = false;
    setIsPointerDown(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startCoords.current) return;

    const deltaX = Math.abs(e.clientX - startCoords.current.x);
    const deltaY = Math.abs(e.clientY - startCoords.current.y);
    const distance = Math.hypot(deltaX, deltaY);

    if (distance >= DRAG_THRESHOLD && !dragTriggered.current) {
      dragTriggered.current = true;
      onInitiateDrag();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!startCoords.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const wasDragging = dragTriggered.current;
    startCoords.current = null;
    setIsPointerDown(false);

    if (wasDragging) {
      // Ending a drag must never trigger a click action
      e.stopPropagation();
      onFinalizeDrag();
      setTimeout(() => {
        dragTriggered.current = false;
      }, 50);
      return;
    }

    // Stationary click -> open Music Island with bouncy spring!
    onOpenMusic();
  };

  return (
    <div
      className={`collapsed-island-surface ${isHovered ? "island-hovered" : ""} ${
        isPointerDown ? "island-pressed" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPointerDown(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      title="MIO Island · Click to open Music Player · Click mascot for Assistant · Drag to move"
    >
      {/* 1. SEPARATE MASCOT TARGET (Click mascot opens Assistant directly) */}
      <div
        className="island-mascot-target no-drag-target"
        onClick={(e) => {
          e.stopPropagation();
          onOpenAssistant();
        }}
        title="Open MIO Assistant"
      >
        <MioMascot size={24} isGlancing={isHovered} />
      </div>

      {/* 2. NON-INTERACTIVE DRAG & IDENTITY REGION */}
      <div className="island-identity-region">
        <span className="island-brand-label">{statusText}</span>
        <span className="island-drag-indicator" />
      </div>

      {/* 3. MINI MUSIC ACTIVITY INDICATOR */}
      <div className="island-activity-target" title="Now Playing: Steve Jobs">
        {isMusicPlaying ? (
          <div className="collapsed-mini-eq">
            <span className="mini-eq-bar mini-bar-1" />
            <span className="mini-eq-bar mini-bar-2" />
            <span className="mini-eq-bar mini-bar-3" />
          </div>
        ) : (
          <span className="island-subtle-indicator" />
        )}
      </div>
    </div>
  );
};
