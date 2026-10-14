import React, { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface MirrorViewProps {
  onClose: () => void;
}

export const MirrorView: React.FC<MirrorViewProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"natural" | "warm" | "studio">("natural");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Webcam access not supported in this environment");
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });

        activeStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
          setIsReady(true);
        }
      } catch (err: any) {
        console.warn("Camera access denied or unavailable:", err);
        setError("Camera permission denied or camera in use");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getFilterStyle = () => {
    switch (filterMode) {
      case "warm":
        return "sepia(0.2) saturate(1.2) brightness(1.05)";
      case "studio":
        return "contrast(1.15) brightness(1.1) saturate(1.05)";
      default:
        return "none";
    }
  };

  return (
    <motion.div
      className="notch-mirror-dropdown"
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mirror-card-header">
        <div className="mirror-header-title">
          <Camera size={15} className="mirror-icon-accent" />
          <span>Quick Mirror</span>
          <span className="live-camera-dot" />
        </div>
        <div className="mirror-header-actions">
          <button
            type="button"
            className={`filter-chip ${filterMode === "natural" ? "active" : ""}`}
            onClick={() => setFilterMode("natural")}
            title="Natural"
          >
            Natural
          </button>
          <button
            type="button"
            className={`filter-chip ${filterMode === "warm" ? "active" : ""}`}
            onClick={() => setFilterMode("warm")}
            title="Warm tone"
          >
            Warm
          </button>
          <button
            type="button"
            className={`filter-chip ${filterMode === "studio" ? "active" : ""}`}
            onClick={() => setFilterMode("studio")}
            title="Studio light"
          >
            Studio
          </button>
          <button
            type="button"
            className="mirror-close-btn"
            onClick={onClose}
            title="Close mirror"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="mirror-viewport-frame">
        {error ? (
          <div className="mirror-fallback-state">
            <div className="mirror-avatar-sim">
              <Camera size={28} className="mirror-offline-icon" />
            </div>
            <p className="mirror-fallback-text">{error}</p>
            <span className="mirror-fallback-hint">
              Check your camera permissions in system settings
            </span>
          </div>
        ) : (
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                transform: "scaleX(-1)",
                filter: getFilterStyle()
              }}
              className="mirror-video-element"
            />
            {!isReady && (
              <div className="mirror-loading-overlay">
                <RefreshCw size={20} className="spin-slow" />
                <span>Opening camera...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mirror-footer-bar">
        <span className="mirror-hint-text">
          Double click to snapshot or press Esc to exit
        </span>
      </div>
    </motion.div>
  );
};
