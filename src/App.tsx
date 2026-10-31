import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  Bluetooth,
  Moon,
  Plane,
  Scissors,
  Lock,
  Music,
  Sun,
  Volume2
} from "lucide-react";
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
  const [isStealthIdle, setIsStealthIdle] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  const [activeActionFeedback, setActiveActionFeedback] = useState<{
    id: string;
    label: string;
    icon: string;
    status: string;
    isConnected?: boolean;
    timestamp: number;
  } | null>(null);

  const actionFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerActionFeedback = useCallback((id: string, label: string, icon: string, status: string, isConnected?: boolean) => {
    if (actionFeedbackTimerRef.current) {
      clearTimeout(actionFeedbackTimerRef.current);
    }
    // New timestamp forces the spring pop animation to trigger even on consecutive clicks!
    setActiveActionFeedback({ id, label, icon, status, isConnected, timestamp: Date.now() });
    actionFeedbackTimerRef.current = setTimeout(() => {
      setActiveActionFeedback(null);
    }, 2000);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stealthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowController = useRef(WindowController.getInstance()).current;

  // Bar is active whenever revealed, pinned, options are open, or input is focused
  const isFullyOpen = isRevealed || isPinned || isOptionsOpen || isInputFocused;

  // Stealth auto-hide timer (Option B: fades to near-invisible after 3.5s of no interaction)
  const resetStealthTimer = useCallback(() => {
    setIsStealthIdle(false);
    if (stealthTimerRef.current) {
      clearTimeout(stealthTimerRef.current);
    }
    // Only fade to stealth mode when the bar is collapsed (not while using it)
    if (!isFullyOpen) {
      stealthTimerRef.current = setTimeout(() => {
        setIsStealthIdle(true);
      }, 3500);
    }
  }, [isFullyOpen]);

  useEffect(() => {
    resetStealthTimer();
    return () => {
      if (stealthTimerRef.current) clearTimeout(stealthTimerRef.current);
    };
  }, [isFullyOpen, resetStealthTimer]);

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
      const targetHeight = isOptionsOpen ? 460 : 200;
      windowController.resizeWindow(400, targetHeight);
    } else {
      const timer = setTimeout(() => {
        windowController.resizeWindow(400, 32);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isFullyOpen, isOptionsOpen, isApp, windowController]);

  // 3. Intentional Hover Logic (400ms deliberate dwell threshold)
  const handleMouseEnter = useCallback(() => {
    resetStealthTimer();

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
    }, 400);
  }, [isFullyOpen, resetStealthTimer]);

  const handleMouseLeave = useCallback(() => {
    resetStealthTimer();

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
  }, [isOptionsOpen, isInputFocused, isPinned, resetStealthTimer]);

  // Click on the collapsed notch to open immediately
  const handleNotchClick = useCallback(() => {
    resetStealthTimer();

    if (!isFullyOpen) {
      if (hoverIntentTimerRef.current) {
        clearTimeout(hoverIntentTimerRef.current);
        hoverIntentTimerRef.current = null;
      }
      setIsRevealed(true);
    }
  }, [isFullyOpen, resetStealthTimer]);

  // 4. Keyboard Shortcuts: Esc to close options or tuck away
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetStealthTimer();
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
  }, [isOptionsOpen, resetStealthTimer]);

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
        onClick={handleNotchClick}
      />

      {/* The Dynamic Chat Bar & Mascot Anchor (Flush to top screen edge) */}
      <div
        className="dynamic-notch-anchor"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleNotchClick}
      >
        <div className="mio-notch-motion-wrapper">
          {/* 
            1. TOP MASCOT DECK (Fluid Morphing Elastic Shell)
            Morphs downward and blooms outward from a compact resting chin into full deck!
            Option B: Fades to stealth 0.08 opacity when idle, snaps to 1 when active!
          */}
          <motion.div
            initial={false}
            animate={{
              y: isFullyOpen ? 0 : -60,
              scaleX: isFullyOpen ? 1 : 0.62,
              opacity: isFullyOpen ? 1 : isStealthIdle ? 0.70 : 1
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
                    duration: isStealthIdle ? 0.8 : 0.25,
                    ease: "easeOut"
                  }
            }
            className={`mio-top-mascot-pod ${isStealthIdle && !isFullyOpen ? "is-stealth-idle" : ""}`}
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

            {/* Centered Expressive 2D Mascot with Morphing Action Feedback Animation */}
            <motion.div
              animate={{
                opacity: isFullyOpen ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 54 }}
            >
              <AnimatePresence mode="wait">
                {activeActionFeedback ? (
                  <motion.div
                    key={`feedback-${activeActionFeedback.id}-${activeActionFeedback.timestamp}`}
                    initial={{ scale: 0.7, opacity: 0, y: 3 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.7, opacity: 0, y: -3 }}
                    transition={{
                      type: "spring",
                      stiffness: 460,
                      damping: 25
                    }}
                    className="mio-mascot-feature-morph"
                  >
                    {/* Pure white symbol on left with subtle glow */}
                    <div className="mio-morph-pure-icon">
                      {activeActionFeedback.icon === "wifi" && <Wifi size={20} />}
                      {activeActionFeedback.icon === "bluetooth" && <Bluetooth size={20} />}
                      {activeActionFeedback.icon === "focus" && <Moon size={20} />}
                      {activeActionFeedback.icon === "airplane" && <Plane size={20} />}
                      {activeActionFeedback.icon === "snip" && <Scissors size={20} />}
                      {activeActionFeedback.icon === "lock" && <Lock size={20} />}
                      {activeActionFeedback.icon === "music" && <Music size={20} />}
                      {activeActionFeedback.icon === "brightness" && <Sun size={20} />}
                      {activeActionFeedback.icon === "volume" && <Volume2 size={20} />}
                      {activeActionFeedback.icon === "stats" && <Cpu size={20} />}
                    </div>

                    {/* Clean minimal text on right */}
                    <div className="mio-morph-badge-text">
                      <span className="mio-morph-name">{activeActionFeedback.label}</span>
                      <span className="mio-morph-status">{activeActionFeedback.status}</span>
                    </div>

                    {/* Cute mini companion reaction face: Sparkle happy on connect, sad on disconnect */}
                    {typeof activeActionFeedback.isConnected === "boolean" && (
                      <div className="mio-morph-mini-face">
                        {activeActionFeedback.isConnected ? (
                          /* Happy smiling face with eye sparkles ✨ ( ^ ‿ ^ ) */
                          <svg width="30" height="24" viewBox="0 0 30 24" className="mio-sparkle-face-svg">
                            {/* Left Sparkle Eye */}
                            <path d="M 7 8 Q 9.5 5 12 8" stroke="#FFFBEA" strokeWidth="2" strokeLinecap="round" fill="none" />
                            {/* Tiny twinkle star next to left eye */}
                            <circle cx="5" cy="4" r="1" fill="#FFE57F" />
                            {/* Right Sparkle Eye */}
                            <path d="M 18 8 Q 20.5 5 23 8" stroke="#FFFBEA" strokeWidth="2" strokeLinecap="round" fill="none" />
                            {/* Tiny twinkle star next to right eye */}
                            <circle cx="25" cy="4" r="1" fill="#FFE57F" />
                            {/* Cute big smile */}
                            <path d="M 11 14 Q 15 19 19 14" stroke="#FF8A65" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                          </svg>
                        ) : (
                          /* Disconnected sad pouty face ( • ︵ • ) */
                          <svg width="30" height="24" viewBox="0 0 30 24" className="mio-sad-face-svg">
                            {/* Left drooping eye */}
                            <circle cx="9.5" cy="8" r="2" fill="#8E8E93" />
                            {/* Right drooping eye */}
                            <circle cx="20.5" cy="8" r="2" fill="#8E8E93" />
                            {/* Sad pouty mouth */}
                            <path d="M 12 17 Q 15 13.5 18 17" stroke="#8E8E93" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                          </svg>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="cute-face"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 26
                    }}
                  >
                    <MioCuteFace
                      size={54}
                      transparentBg={true}
                      isRecording={isRecording}
                      isInputFocused={isInputFocused}
                      isRevealed={isFullyOpen}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
              onActionTrigger={triggerActionFeedback}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
