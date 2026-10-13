# MIO Island — starter prototype

A Windows-first, macOS-compatible starter for MIO's minimal floating island and compact control center.

## Current prototype capabilities

- Expand/collapse the island with Motion animations.
- Click the mascot to open the assistant surface.
- Click the island controls to open the control center.
- Interactive preview toggles for Wi-Fi and Bluetooth.
- Interactive preview sliders for volume and brightness.
- Keyboard shortcut preview: `Ctrl/Cmd + Shift + Space` opens MIO.
- Escape closes the expanded panel.
- Reduced-motion CSS support.
- A platform adapter boundary ready for native implementations.

## Important honesty note

This starter currently simulates OS control state and AI responses. The Wi-Fi/Bluetooth switches, volume/brightness sliders, media actions and microphone indicator do **not** change real operating-system settings or access the microphone yet. Native Tauri commands and platform-specific implementations must be added before those features are presented as functional.

The interface also runs as a web preview; the Tauri window is configured as a transparent, always-on-top starter window, but true no-focus-steal positioning and platform-specific behaviour still need native implementation and testing.

## Run the web preview

Install Node.js LTS, then from this directory:

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite.

## Run as a Tauri desktop app

Install the prerequisites for Tauri 2 for your OS, including Rust and the required system build tools. Then:

```bash
npm install
npm run tauri dev
```

If the `tauri` script is not found, use:

```bash
npx tauri dev
```

For Windows, install the Microsoft C++ Build Tools and WebView2 prerequisites as documented by Tauri. For macOS, install Xcode Command Line Tools.

## Suggested next engineering tasks

1. Replace simulated controls in `src/platform/controls.ts` with Tauri `invoke()` calls.
2. Add native Windows implementations for volume, brightness, battery, Wi-Fi and Bluetooth where supported.
3. Add the macOS platform adapter behind the same interface.
4. Implement a native overlay window lifecycle that preserves focus and hides in selected full-screen apps.
5. Replace the preview assistant response with a local MIO Core API and task-event stream.
6. Add settings for startup, global shortcut, monitor placement, reduced motion and notification quiet hours.
