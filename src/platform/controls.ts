/**
 * Platform boundary for MIO system controls.
 *
 * The browser preview uses simulated state. Replace these functions with
 * Tauri commands backed by native Windows APIs before claiming that a control
 * changes the actual OS setting.
 */
export type ControlSnapshot = {
  wifi: boolean;
  bluetooth: boolean;
  volume: number;
  brightness: number;
  battery: number;
  charging: boolean;
};

const previewState: ControlSnapshot = {
  wifi: true,
  bluetooth: true,
  volume: 42,
  brightness: 72,
  battery: 86,
  charging: false
};

export async function getControlSnapshot(): Promise<ControlSnapshot> {
  return { ...previewState };
}

export async function setPreviewToggle(
  key: "wifi" | "bluetooth",
  value: boolean
): Promise<ControlSnapshot> {
  previewState[key] = value;
  return { ...previewState };
}

export async function setPreviewLevel(
  key: "volume" | "brightness",
  value: number
): Promise<ControlSnapshot> {
  previewState[key] = Math.max(0, Math.min(100, value));
  return { ...previewState };
}
