import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import {
  WindowController,
  isNativeApp
} from "./platform/windowController";
import { usePrefersReducedMotion } from "./utils/motion";
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
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
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

    // Initialize with topInset = 0 and height 32 for the sleek collapsed resting bulge
    windowController.initPlacement(400, 32, 0);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [windowController]);

  // 2. Adjust Native Window Dimensions dynamically
  // CRITICAL FIX: When collapsing, wait 700ms for the exit morph to completely finish
  // before shrinking the native window to 32px (ample room for 16px bulge + hit target).
  useEffect(() => {
    if (!isApp) return;

    if (isFullyOpen) {
      windowController.resizeWindow(400, 450);
    } else {
      const timer = setTimeout(() => {
        windowController.resizeWindow(400, 32);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isFullyOpen, isApp, windowController]);

  // 3. Intentional Hover Logic (100ms deliberate hover threshold)
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
    }, 100);
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
    }, 280);
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
        <div className="mio-notch-motion-wrapper">
          {/* 
            1. TOP MASCOT DECK (Fluid Morphing Elastic Shell)
            Morphs downward and blooms outward from a compact resting chin into full deck!
          */}
          <motion.div
            initial={false}
            animate={{
              y: isFullyOpen ? 0 : -60,
              scaleX: isFullyOpen ? 1 : 0.62,
              opacity: 1
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0.1 }
                : isFullyOpen
                ? {
                    type: "spring",
                    stiffness: 280,
                    damping: 28,
                    mass: 0.8,
                    bounce: 0
                  }
                : {
                    duration: 0.35,
                    ease: [0.32, 0, 0.67, 0]
                  }
            }
            className="mio-top-mascot-pod"
            title="MIO 2D Companion"
          >
            {/* Concave Ears: Smooth outward curve connecting to top screen bezel with 6px upward bleed */}
            <NotchEarLeft size={22} fill="#000000" />
            <NotchEarRight size={22} fill="#000000" />

            <motion.span
              className="mio-mascot-deck-tag"
              animate={{ opacity: isFullyOpen ? 1 : 0 }}
              transition={{ duration: 0.18 }}
            >
              MIO
            </motion.span>

            {/* Centered Expressive 2D Mascot with Wake-Up Animation */}
            <motion.div
              animate={{
                opacity: isFullyOpen ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <MioCuteFace
                size={54}
                transparentBg={true}
                isRecording={isRecording}
                isInputFocused={isInputFocused}
                isRevealed={isFullyOpen}
              />
            </motion.div>

            {/* Tiny Green Online Dot (represents connected to internet) */}
            <motion.span
              className={`mio-online-indicator-dot ${isOnline ? "is-online" : "is-offline"}`}
              title={isOnline ? "Connected to internet" : "Offline · No internet"}
              aria-label={isOnline ? "Connected to internet" : "Offline"}
              animate={{ opacity: isFullyOpen ? 1 : 0 }}
              transition={{ duration: 0.18 }}
            />

            {/* Peek Indicator Glint: Centered in the 16px collapsed bulge so user knows MIO is ok */}
            {!isFullyOpen && <div className="notch-tuck-chin-glint" />}
          </motion.div>

          {/* 
            2. CHAT BAR (Staggered Fluid Cascade Drop)
            Drops down out from behind the mascot deck with an organic spring cushion!
          */}
          <motion.div
            initial={false}
            animate={{
              y: isFullyOpen ? 0 : -32,
              scale: isFullyOpen ? 1 : 0.92,
              opacity: isFullyOpen ? 1 : 0
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0.1 }
                : isFullyOpen
                ? {
                    type: "spring",
                    stiffness: 240,
                    damping: 22,
                    mass: 0.8,
                    delay: 0.05 // Organic stagger
                  }
                : {
                    duration: 0.30,
                    ease: [0.32, 0, 0.67, 0]
                  }
            }
            style={{ pointerEvents: isFullyOpen ? "auto" : "none" }}
          >
            <MioChatBar
              isOptionsOpen={isOptionsOpen}
              onOptionsToggle={(open) => setIsOptionsOpen(open)}
              onInputFocusChange={(focused) => setIsInputFocused(focused)}
              onSubmitCommand={handleCommandSubmit}
              onSelectOption={handleSelectOption}
              isRecording={isRecording}
              onRecordingToggle={() => setIsRecording(!isRecording)}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
