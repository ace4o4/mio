import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface MioCuteFaceProps {
  size?: number;
  isRecording?: boolean;
  isInputFocused?: boolean;
  hasQuery?: boolean;
  transparentBg?: boolean;
  onClick?: () => void;
}

type FaceMood = "idle" | "happy" | "glance-left" | "glance-right" | "look-down" | "wink" | "talking";

export const MioCuteFace: React.FC<MioCuteFaceProps> = ({
  size = 32,
  isRecording = false,
  isInputFocused = false,
  hasQuery = false,
  transparentBg = false,
  onClick
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mood, setMood] = useState<FaceMood>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [reactionText, setReactionText] = useState<string | null>(null);

  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickReactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Natural Organic Blinking Cycle (Every 3.2 - 5.5 seconds)
  useEffect(() => {
    let active = true;

    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 2400;
      blinkTimerRef.current = setTimeout(() => {
        if (!active) return;
        setIsBlinking(true);

        // Eyes shut for 140ms
        setTimeout(() => {
          if (!active) return;
          setIsBlinking(false);

          // 25% chance of a cute double-blink!
          if (Math.random() < 0.25) {
            setTimeout(() => {
              if (!active) return;
              setIsBlinking(true);
              setTimeout(() => {
                if (!active) return;
                setIsBlinking(false);
                scheduleBlink();
              }, 120);
            }, 140);
          } else {
            scheduleBlink();
          }
        }, 140);
      }, delay);
    };

    scheduleBlink();

    return () => {
      active = false;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // 2. Idle Gaze / Glance shifts (Looking left, right, or down)
  useEffect(() => {
    if (isRecording || isHovered || isInputFocused) return;

    glanceTimerRef.current = setInterval(() => {
      const r = Math.random();
      if (r < 0.25) {
        setMood("glance-left");
        setTimeout(() => setMood("idle"), 1300);
      } else if (r < 0.5) {
        setMood("glance-right");
        setTimeout(() => setMood("idle"), 1300);
      }
    }, 4500);

    return () => {
      if (glanceTimerRef.current) clearInterval(glanceTimerRef.current);
    };
  }, [isRecording, isHovered, isInputFocused]);

  // 3. Reacting to Voice / Input Focus / Hover States
  useEffect(() => {
    if (isRecording) {
      setMood("talking");
    } else if (isHovered) {
      setMood("happy");
    } else if (hasQuery || isInputFocused) {
      setMood("look-down");
    } else {
      setMood("idle");
    }
  }, [isRecording, isHovered, isInputFocused, hasQuery]);

  // 4. Click Interaction (Cute wink + happy greeting)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMood("wink");
    const greetings = ["Hi there! ✨", "Listening! 👂", "Mio is ready! 🚀", "What's on your mind? 💭"];
    const chosen = greetings[Math.floor(Math.random() * greetings.length)];
    setReactionText(chosen);

    if (clickReactionTimerRef.current) clearTimeout(clickReactionTimerRef.current);
    clickReactionTimerRef.current = setTimeout(() => {
      setMood(isHovered ? "happy" : "idle");
      setReactionText(null);
    }, 1600);

    if (onClick) onClick();
  };

  // Compute Eye Offsets based on mood
  let eyeOffsetX = 0;
  let eyeOffsetY = 0;
  if (mood === "glance-left") eyeOffsetX = -1.6;
  if (mood === "glance-right") eyeOffsetX = 1.6;
  if (mood === "look-down") eyeOffsetY = 1.2;

  const isHappy = mood === "happy";
  const isWink = mood === "wink";
  const isTalking = mood === "talking";

  return (
    <div
      className="mio-cute-face-wrapper"
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      title="MIO 2D Companion (Click for cute reaction)"
    >
      <motion.div
        className="mio-cute-face-card"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={
          isTalking
            ? { y: [0, -1.5, 0], transition: { repeat: Infinity, duration: 0.6 } }
            : isHappy
            ? { y: [0, -1, 0], transition: { repeat: Infinity, duration: 1.2 } }
            : { y: 0 }
        }
      >
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className="mio-cute-face-svg"
        >
          {/* Pure OLED Black Body Squircle (or Transparent for 10px Glass Pod) */}
          <rect
            x="1"
            y="1"
            width="30"
            height="30"
            rx="9"
            fill={transparentBg ? "transparent" : "#09090C"}
          />

          {/* ============================================================ */}
          {/* EYES (2D Capsule Vector Glowing Eyes)                         */}
          {/* ============================================================ */}
          <g
            className="mio-face-eyes-group"
            style={{
              transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)`,
              transition: "transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1)"
            }}
          >
            {/* LEFT EYE */}
            {isHappy || isWink ? (
              // Happy / Wink Eye: Cute upward curved arc ( ◡ )
              <path
                d="M 8.5 14.5 Q 11 11.2 13.5 14.5"
                stroke="#FFFBEA"
                strokeWidth="2.1"
                strokeLinecap="round"
                fill="none"
              />
            ) : isBlinking ? (
              // Blinking Eye: Horizontal line
              <line
                x1="8.5"
                y1="14.5"
                x2="13.5"
                y2="14.5"
                stroke="#FFFBEA"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              // Default 2D Capsule Eye (Taller rounded pill)
              <rect
                x="8.5"
                y="9.5"
                width="5"
                height="10"
                rx="2.5"
                fill="#FFFBEA"
              />
            )}

            {/* RIGHT EYE */}
            {isHappy ? (
              // Happy Right Eye: Cute upward curved arc
              <path
                d="M 18.5 14.5 Q 21 11.2 23.5 14.5"
                stroke="#FFFBEA"
                strokeWidth="2.1"
                strokeLinecap="round"
                fill="none"
              />
            ) : isBlinking && !isWink ? (
              // Blinking Right Eye
              <line
                x1="18.5"
                y1="14.5"
                x2="23.5"
                y2="14.5"
                stroke="#FFFBEA"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              // Default 2D Capsule Eye
              <rect
                x="18.5"
                y="9.5"
                width="5"
                height="10"
                rx="2.5"
                fill="#FFFBEA"
              />
            )}
          </g>

          {/* ============================================================ */}
          {/* MOUTH (Cute Coral / Peach 2D Smile)                          */}
          {/* ============================================================ */}
          <g className="mio-face-mouth-group">
            {isTalking ? (
              // Talking / Voice pulse open smile
              <motion.path
                animate={{
                  d: [
                    "M 13 22 Q 16 26.5 19 22",
                    "M 13 22 Q 16 23.5 19 22",
                    "M 13 22 Q 16 26.5 19 22"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                stroke="#FF8A65"
                strokeWidth="1.7"
                strokeLinecap="round"
                fill="none"
              />
            ) : isHappy || isWink ? (
              // Bigger happy smile
              <path
                d="M 12 21.5 Q 16 26.5 20 21.5"
                stroke="#FF8A65"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Subtle cute calm smile
              <path
                d="M 13 22.2 Q 16 25 19 22.2"
                stroke="#FF8A65"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </svg>
      </motion.div>

      {/* Floating Mini Speech Tooltip on Click */}
      <AnimatePresence>
        {reactionText && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.16 }}
            className="mio-face-reaction-bubble"
          >
            {reactionText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
