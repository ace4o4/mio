import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  WindowController,
  isNativeApp
} from "./platform/windowController";
import type { ControlSnapshot } from "./platform/controls";
import {
  getControlSnapshot,
  setPreviewLevel,
  setPreviewToggle
} from "./platform/controls";
import { MOTION_TOKENS, usePrefersReducedMotion } from "./utils/motion";

import { CollapsedIsland } from "./components/CollapsedIsland";
import { ControlCenterSurface } from "./components/ControlCenterSurface";
import { AssistantSurface } from "./components/AssistantSurface";

type PanelMode = "control_center" | "assistant" | null;

export default function App() {
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [isApp, setIsApp] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // System Controls Snapshot
  const [controlsState, setControlsState] = useState<ControlSnapshot>({
    wifi: true,
    bluetooth: true,
    volume: 65,
    brightness: 75,
    battery: 88,
    charging: true
  });
  const [dnd, setDnd] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const windowController = useRef(WindowController.getInstance()).current;

  // 1. Initial Launch Placement & Native Check (Phase 1)
  useEffect(() => {
    const runningNative = isNativeApp();
    setIsApp(runningNative);

    if (runningNative) {
      document.documentElement.classList.add("native-mode");
      document.body.classList.add("native-mode");
    }

    // Initialize placement (top-centre with 14px top inset or restore valid saved position)
    windowController.initPlacement(210, 46, 14);

    // Fetch initial controls snapshot
    getControlSnapshot().then(setControlsState);
  }, [windowController]);

  // 2. Adjust Window Geometry on Expansion / Collapse (Phase 1 & 2)
  useEffect(() => {
    if (!isApp) return;

    if (panelMode === "control_center") {
      windowController.resizeWindow(440, 400);
    } else if (panelMode === "assistant") {
      windowController.resizeWindow(400, 360);
    } else {
      windowController.resizeWindow(210, 46);
    }
  }, [panelMode, isApp, windowController]);

  // 3. Escape Key & Global Shortcut Handling (Section 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes expanded panel predictably
      if (e.key === "Escape" && panelMode !== null) {
        e.preventDefault();
        setPanelMode(null);
      }

      // Propose Ctrl/Cmd + Shift + Space to toggle Control Center
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "Space") {
        e.preventDefault();
        setPanelMode((prev) => (prev === null ? "control_center" : null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelMode]);

  // 4. Outside-Click / Blur Dismissal (Section 4)
  useEffect(() => {
    // Window defocus dismissal
    const cleanupBlur = windowController.setupBlurListener(() => {
      if (panelMode !== null) {
        setPanelMode(null);
      }
    });

    // In-browser click outside container
    const handlePointerDownOutside = (e: MouseEvent) => {
      if (panelMode === null) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelMode(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      cleanupBlur();
      window.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [panelMode, windowController]);

  // 5. Drag Handling with strict 5-7px threshold (Section 3)
  const handleInitiateDrag = useCallback(() => {
    isDraggingRef.current = true;
    windowController.startDragging();
  }, [windowController]);

  const handleFinalizeDrag = useCallback(() => {
    if (isDraggingRef.current) {
      windowController.finalizeDrag(210, 46);
      isDraggingRef.current = false;
    }
  }, [windowController]);

  // 6. Reset Position to Top-Centre (Section 3)
  const handleResetPosition = useCallback(() => {
    windowController.resetToTopCenter(
      panelMode === "control_center" ? 440 : panelMode === "assistant" ? 400 : 210,
      panelMode === "control_center" ? 400 : panelMode === "assistant" ? 360 : 46
    );
  }, [panelMode, windowController]);

  // 7. System Control Handlers (Platform-backed)
  const handleToggle = async (key: "wifi" | "bluetooth") => {
    setControlsState(await setPreviewToggle(key, !controlsState[key]));
  };

  const handleLevel = async (key: "volume" | "brightness", value: number) => {
    setControlsState(await setPreviewLevel(key, value));
  };

  const transitionConfig = prefersReducedMotion
    ? MOTION_TOKENS.reducedMotion
    : MOTION_TOKENS.spring.island;

  return (
    <main
      className={`mio-viewport ${isApp ? "native-mode" : "preview-mode"}`}
      ref={containerRef}
    >
      {/* Browser Preview Status Bar */}
      {!isApp && (
        <header className="preview-top-bar">
          <span className="preview-brand-tag">MIO Desktop Shell · Phase 1 & 2</span>
          <span>Press Esc to collapse · Ctrl+Shift+Space to toggle</span>
        </header>
      )}

      {/* The Dynamic Island Anchor */}
      <div className="island-anchor">
        <motion.div
          layout
          transition={transitionConfig}
          className={`mio-island-container ${
            panelMode === null
              ? "island-state-collapsed"
              : panelMode === "control_center"
              ? "island-state-control-center"
              : "island-state-assistant"
          }`}
        >
          <AnimatePresence mode="wait">
            {panelMode === null ? (
              /* COLLAPSED STATE (Section 2) */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: MOTION_TOKENS.duration.contentEntrance }}
                style={{ width: "100%", height: "100%" }}
              >
                <CollapsedIsland
                  onOpenAssistant={() => setPanelMode("assistant")}
                  onOpenControlCenter={() => setPanelMode("control_center")}
                  onInitiateDrag={handleInitiateDrag}
                  onFinalizeDrag={handleFinalizeDrag}
                  statusText="MIO"
                />
              </motion.div>
            ) : panelMode === "control_center" ? (
              /* EXPANDED CONTROL CENTER STATE (Section 5) */
              <motion.div
                key="control_center"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: MOTION_TOKENS.duration.contentEntrance }}
                style={{ width: "100%", height: "100%" }}
              >
                <ControlCenterSurface
                  state={controlsState}
                  onToggle={handleToggle}
                  onLevel={handleLevel}
                  dnd={dnd}
                  onToggleDnd={() => setDnd(!dnd)}
                  onResetPosition={handleResetPosition}
                  onClose={() => setPanelMode(null)}
                />
              </motion.div>
            ) : (
              /* EXPANDED MIO ASSISTANT STATE (Section 6) */
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: MOTION_TOKENS.duration.contentEntrance }}
                style={{ width: "100%", height: "100%" }}
              >
                <AssistantSurface
                  onResetPosition={handleResetPosition}
                  onClose={() => setPanelMode(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
