import { isTauri } from "@tauri-apps/api/core";
import {
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
  currentMonitor
} from "@tauri-apps/api/window";

export interface Position {
  x: number;
  y: number;
}

export interface MonitorMetrics {
  width: number;
  height: number;
  scaleFactor: number;
}

const STORAGE_KEY = "mio_island_placement_v1";

/**
 * Checks whether the app is executing inside the Tauri runtime.
 */
export function isNativeApp(): boolean {
  try {
    return isTauri();
  } catch {
    return false;
  }
}

/**
 * Retrieves monitor dimensions and scale factor.
 * Falls back to browser window dimensions in web preview.
 */
export async function getMonitorMetrics(): Promise<MonitorMetrics> {
  if (isNativeApp()) {
    try {
      const mon = await currentMonitor();
      if (mon) {
        const scale = mon.scaleFactor || 1;
        return {
          width: Math.round(mon.size.width / scale),
          height: Math.round(mon.size.height / scale),
          scaleFactor: scale
        };
      }
    } catch (err) {
      console.warn("Failed to get native monitor metrics, falling back to window:", err);
    }
  }

  return {
    width: window.innerWidth || 1920,
    height: window.innerHeight || 1080,
    scaleFactor: window.devicePixelRatio || 1
  };
}

/**
 * Reads the persisted island position from local storage.
 */
export function getSavedPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch (err) {
    console.warn("Failed to read saved position:", err);
  }
  return null;
}

/**
 * Persists the island position into local storage.
 */
export function persistPosition(pos: Position): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch (err) {
    console.warn("Failed to persist position:", err);
  }
}

/**
 * Clears the saved position (for Reset / Return to top-centre).
 */
export function clearSavedPosition(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear saved position:", err);
  }
}

/**
 * Clamps a given position inside the usable screen boundaries.
 */
export function clampCoordinates(
  x: number,
  y: number,
  width: number,
  height: number,
  metrics: MonitorMetrics
): Position {
  const minX = 0;
  const maxX = Math.max(minX, metrics.width - width);
  const minY = 0;
  const maxY = Math.max(minY, metrics.height - height);

  return {
    x: Math.max(minX, Math.min(maxX, Math.round(x))),
    y: Math.max(minY, Math.min(maxY, Math.round(y)))
  };
}

/**
 * Computes the canonical top-centre position (pinned flush to top screen edge).
 */
export function computeTopCenter(
  islandWidth: number,
  metrics: MonitorMetrics,
  topInset = 0
): Position {
  const x = Math.round((metrics.width - islandWidth) / 2);
  const y = topInset;
  return clampCoordinates(x, y, islandWidth, 50, metrics);
}

/**
 * Native Window Controller
 */
export class WindowController {
  private static instance: WindowController;
  private currentPos: Position | null = null;
  private currentWidth: number = 210;

  static getInstance(): WindowController {
    if (!WindowController.instance) {
      WindowController.instance = new WindowController();
    }
    return WindowController.instance;
  }

  /**
   * Initializes window placement on app launch.
   * Restores saved position if within bounds, otherwise anchors at top-center.
   */
  async initPlacement(
    collapsedWidth: number,
    collapsedHeight: number,
    topInset = 0
  ): Promise<Position> {
    const metrics = await getMonitorMetrics();
    const saved = getSavedPosition();

    let target: Position;
    if (saved && this.isPositionValid(saved, collapsedWidth, collapsedHeight, metrics)) {
      target = clampCoordinates(saved.x, saved.y, collapsedWidth, collapsedHeight, metrics);
    } else {
      target = computeTopCenter(collapsedWidth, metrics, topInset);
    }

    this.currentPos = target;
    this.currentWidth = collapsedWidth;

    if (isNativeApp()) {
      try {
        const win = getCurrentWindow();
        await win.setPosition(new LogicalPosition(target.x, target.y));
        await win.setSize(new LogicalSize(collapsedWidth, collapsedHeight));
      } catch (err) {
        console.warn("Native window placement failed:", err);
      }
    }

    return target;
  }

  /**
   * Adjusts the window size and updates position anchors when expanding/collapsing.
   * Maintains horizontal center alignment smoothly.
   */
  async resizeWindow(
    width: number,
    height: number,
    anchorPos?: Position
  ): Promise<void> {
    if (!isNativeApp()) return;

    try {
      const win = getCurrentWindow();
      const metrics = await getMonitorMetrics();

      const prevCenterX = this.currentPos
        ? this.currentPos.x + this.currentWidth / 2
        : metrics.width / 2;
      const targetX = Math.round(prevCenterX - width / 2);
      const targetY = anchorPos ? anchorPos.y : (this.currentPos ? this.currentPos.y : 14);
      const clamped = clampCoordinates(targetX, targetY, width, height, metrics);

      this.currentPos = clamped;
      this.currentWidth = width;

      await win.setPosition(new LogicalPosition(clamped.x, clamped.y));
      await win.setSize(new LogicalSize(width, height));
    } catch (err) {
      console.warn("Native window resize failed:", err);
    }
  }

  /**
   * Begins native window dragging.
   */
  async startDragging(): Promise<void> {
    if (!isNativeApp()) return;
    try {
      const win = getCurrentWindow();
      await win.startDragging();
    } catch (err) {
      console.warn("Failed to initiate native drag:", err);
    }
  }

  /**
   * Records the final position after a drag finishes, clamps it and persists.
   */
  async finalizeDrag(islandWidth: number, islandHeight: number): Promise<Position | null> {
    if (!isNativeApp()) return this.currentPos;

    try {
      const win = getCurrentWindow();
      const pos = await win.outerPosition();
      const metrics = await getMonitorMetrics();

      const logicalX = Math.round(pos.x / metrics.scaleFactor);
      const logicalY = Math.round(pos.y / metrics.scaleFactor);

      const clamped = clampCoordinates(logicalX, logicalY, islandWidth, islandHeight, metrics);
      this.currentPos = clamped;
      this.currentWidth = islandWidth;
      persistPosition(clamped);

      // Snap to clamped position if outside bounds
      if (logicalX !== clamped.x || logicalY !== clamped.y) {
        await win.setPosition(new LogicalPosition(clamped.x, clamped.y));
      }

      return clamped;
    } catch (err) {
      console.warn("Failed to finalize window position:", err);
      return this.currentPos;
    }
  }

  /**
   * Resets placement to top-centre.
   */
  async resetToTopCenter(islandWidth: number, islandHeight: number): Promise<Position> {
    clearSavedPosition();
    const metrics = await getMonitorMetrics();
    const target = computeTopCenter(islandWidth, metrics, 14);
    this.currentPos = target;
    this.currentWidth = islandWidth;

    if (isNativeApp()) {
      try {
        const win = getCurrentWindow();
        await win.setPosition(new LogicalPosition(target.x, target.y));
        await win.setSize(new LogicalSize(islandWidth, islandHeight));
      } catch (err) {
        console.warn("Failed to reset window position:", err);
      }
    }

    return target;
  }

  /**
   * Registers a listener for window blur (outside click / defocus dismissal).
   */
  setupBlurListener(onBlur: () => void): () => void {
    if (isNativeApp()) {
      let unlisten: (() => void) | null = null;
      getCurrentWindow()
        .listen("tauri://blur", () => {
          onBlur();
        })
        .then((fn) => {
          unlisten = fn;
        })
        .catch((e) => console.warn("Could not register tauri blur listener:", e));

      return () => {
        if (unlisten) unlisten();
      };
    } else {
      const handler = () => onBlur();
      window.addEventListener("blur", handler);
      return () => window.removeEventListener("blur", handler);
    }
  }

  private isPositionValid(
    pos: Position,
    width: number,
    height: number,
    metrics: MonitorMetrics
  ): boolean {
    return (
      pos.x >= 0 &&
      pos.x + width <= metrics.width + 100 &&
      pos.y >= 0 &&
      pos.y + height <= metrics.height + 100
    );
  }
}
