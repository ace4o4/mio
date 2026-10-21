import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import {
  WindowController,
  isNativeApp
} from "./platform/windowController";
import { MOTION_TOKENS, usePrefersReducedMotion } from "./utils/motion";
import { MioChatBar } from "./components/MioChatBar";
import { MioCuteFace } from "./components/MioCuteFace";
import { NotchEarLeft, NotchEarRight } from "./components/NotchEars";

export default function App() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isApp, setIsApp] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowController = useRef(WindowController.getInstance()).current;

  // Bar is active whenever revealed, pinned, options are open, or input is focused
  const isFullyOpen = isRevealed || isPinned || isOptionsOpen || isInputFocused;

  // 1. Initial Launch Placement (Flush against top bezel, topInset = 0)
  useEffect(() => {
    const runningNative = isNativeApp();
    setIsApp(runningNative);

    if (runningNative) {
      document.documentElement.classList.add("native-mode");
      document.body.classList.add("native-mode");
    }

    // Initialize with topInset = 0
    windowController.initPlacement(400, 140, 0);
  }, [windowController]);

  // 2. Adjust Native Window Dimensions dynamically
  // Keep window at 450px whenever isFullyOpen is true
  useEffect(() => {
    if (!isApp) return;

    if (isFullyOpen) {
      windowController.resizeWindow(400, 450);
    } else {
      // Tucked state: minimal 26px height so mouse clicks on rest of screen pass through
      windowController.resizeWindow(400, 26);
    }
  }, [isFullyOpen, isApp, windowController]);

  // 3. Intentional Hover Logic (120ms deliberate hover threshold)
  const handleMouseEnter = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    if (isFullyOpen) return;

    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
    }
    hoverIntentTimerRef.current = setTimeout(() => {
      setIsRevealed(true);
      hoverIntentTimerRef.current = null;
    }, 120);
  }, [isFullyOpen]);

  const handleMouseLeave = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }

    // Do not collapse if options menu is open, input is focused, or pinned
    if (isOptionsOpen || isInputFocused || isPinned) return;

    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
    }
    collapseTimerRef.current = setTimeout(() => {
      setIsRevealed(false);
      collapseTimerRef.current = null;
    }, 320);
  }, [isOptionsOpen, isInputFocused, isPinned]);

  // 4. Keyboard Shortcuts: Esc to close options or tuck away
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isOptionsOpen) {
          setIsOptionsOpen(false);
        } else {
          setIsPinned(false);
          setIsRevealed(false);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "Space") {
        e.preventDefault();
        setIsPinned((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOptionsOpen]);

  const handleCommandSubmit = (command: string) => {
    console.log("Executed command:", command);
  };

  const handleSelectOption = (optionId: string) => {
    console.log("Selected option:", optionId);
  };

  // Cinematic glide transition (~40% faster: smooth ~0.75s settle with zero harsh stops)
  const glideTransition = prefersReducedMotion
    ? MOTION_TOKENS.reducedMotion
    : isFullyOpen
    ? MOTION_TOKENS.spring.cinematicGlide
    : MOTION_TOKENS.spring.cinematicGlideOut;

  return (
    <main className="mio-viewport" ref={containerRef}>
      {/* 
        Invisible Top Hover Trigger Zone:
        When revealed/open, pointer-events: none ensures 4-squares button and inputs get 100% of clicks!
      */}
      <div
        className={`top-hover-trigger-hitbox ${isFullyOpen ? "hitbox-disabled" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* The Dynamic Chat Bar & Mascot Anchor (Flush to top screen edge) */}
      <div
        className="dynamic-notch-anchor"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ y: "-90%" }}
          animate={{
            y: isFullyOpen ? "0px" : "-90%"
          }}
          transition={glideTransition}
          className={`mio-notch-motion-wrapper ${
            isFullyOpen ? "notch-revealed" : "notch-tucked"
          }`}
        >
          {/* 
            Top Horizontal Mascot Deck (Apple Hard 3D Glass):
            Horizontally covers the entire width of the bottom bar (368px)
          */}
          <div className="mio-top-mascot-pod" title="MIO 2D Companion">
            {/* Concave Ears: Smooth outward curve connecting to top screen bezel */}
            <NotchEarLeft size={20} fill="#000000" />
            <NotchEarRight size={20} fill="#000000" />

            <span className="mio-mascot-deck-tag">MIO</span>

            {/* Centered Expressive 2D Mascot */}
            <MioCuteFace
              size={48}
              transparentBg={true}
              isRecording={isRecording}
              isInputFocused={isInputFocused}
            />

            <div className="mio-mascot-deck-status">
              <span className="mio-status-dot" />
              <span>ACTIVE</span>
            </div>
          </div>

          {/* Unified Floating Chat Bar with Smooth Expandable Options */}
          <MioChatBar
            isOptionsOpen={isOptionsOpen}
            onOptionsToggle={(open) => setIsOptionsOpen(open)}
            onInputFocusChange={(focused) => setIsInputFocused(focused)}
            onSubmitCommand={handleCommandSubmit}
            onSelectOption={handleSelectOption}
            isRecording={isRecording}
            onRecordingToggle={() => setIsRecording(!isRecording)}
          />

          {/* Peek Indicator Glint when tucked away */}
          {!isFullyOpen && <div className="notch-tuck-chin-glint" />}
        </motion.div>
      </div>
    </main>
  );
}
