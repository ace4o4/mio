import { useEffect, useState } from "react";

/**
 * Hook to respect OS-level reduced motion preferences.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Motion Tokens & Apple Bouncy Springs
 */
export const MOTION_TOKENS = {
  // Timings (ms)
  duration: {
    hover: 0.12,
    toggle: 0.15,
    panelSubview: 0.18,
    islandExpansion: 0.28,
    contentEntrance: 0.16,
    mascotReaction: 0.18
  },
  // Bouncy Apple Springs (Fluid droplet & bounce physics)
  spring: {
    // Bouncy Dynamic Island expansion (fluid overshoot and natural settle)
    island: {
      type: "spring" as const,
      stiffness: 410,
      damping: 22,
      mass: 0.75
    },
    // Cinematic glide (~40% faster: snappy ~0.75s luxurious ease with zero jitter)
    cinematicGlide: {
      type: "spring" as const,
      stiffness: 155,
      damping: 19,
      mass: 0.75
    },
    cinematicGlideOut: {
      type: "spring" as const,
      stiffness: 175,
      damping: 22,
      mass: 0.75
    },
    bouncy: {
      type: "spring" as const,
      stiffness: 440,
      damping: 20,
      mass: 0.7
    },
    quick: {
      type: "spring" as const,
      stiffness: 480,
      damping: 25,
      mass: 0.6
    },
    subtle: {
      type: "spring" as const,
      stiffness: 340,
      damping: 22,
      mass: 0.7
    }
  },
  // Linear for Reduced Motion
  reducedMotion: {
    type: "tween" as const,
    duration: 0.12,
    ease: "easeOut" as const
  }
};
