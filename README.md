# MIO — Living Dynamic Island

An autonomous multi-agent AI ecosystem for 100% workflow automation. Seamlessly bridging OS-level operations, cloud deployments, and complex creative pipelines via low-latency natural voice and chat commands.

A cross-platform (Windows & macOS) minimal floating Dynamic Island and compact control center built with **Tauri 2**, **Rust**, **React**, and **Framer Motion**.

## Features

- **Apple Dynamic Island Aesthetics**: Pure OLED black (`#000000`), glassmorphic hairline rings, and vibrant high-contrast accents.
- **Top-Center Screen Snapping**: Anchors automatically 2–3px below the top screen bezel in the middle of your monitor.
- **Native Draggability**: Drag MIO anywhere across multiple displays with native OS window dragging.
- **Fluid Spring Physics**: Apple-tuned organic spring transitions (`stiffness: 420, damping: 32`).
- **Compact & Expanded States**:
  - **Compact Pill**: Minimal idle notch with mascot glint, live equalizer spectrum, and battery status.
  - **Control Center**: Wi-Fi, Bluetooth, Focus / Do Not Disturb, Battery health, and Apple-style thick capsule sliders for Volume & Brightness.
  - **Media Player**: Album artwork with radial glow, real-time live equalizer visualizer, interactive scrubber timeline, and playback controls.
  - **MIO Core Assistant**: Holographic edge aura, live voice waveform visualizer, quick action chips, and prompt input box.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) LTS
- [Rust](https://www.rust-lang.org/) (installed via rustup)
- **Windows**: Microsoft C++ Build Tools (with "Desktop development with C++")
- **macOS**: Xcode Command Line Tools

### Run as Native Desktop App

```bash
npm install
npm run dev:app
# or: npm run tauri dev
```

### Run Web Preview

```bash
npm run dev
```

## License

MIT License — see [LICENSE](LICENSE) for details.
