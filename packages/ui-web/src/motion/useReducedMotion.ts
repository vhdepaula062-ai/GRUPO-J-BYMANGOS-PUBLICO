"use client";

import { useState, useEffect } from "react";

export interface MotionCapabilities {
  prefersReducedMotion: boolean;
  canHover: boolean;
  hasFinePointer: boolean;
  supports3D: boolean;
}

/**
 * Hook para detectar preferências de movimento e capacidades de entrada (mouse vs. touch)
 * Garante que animações 3D e magnéticas sejam desativadas em telas de toque e quando o usuário solicita redução de movimento.
 */
export function useMotionCapabilities(): MotionCapabilities {
  const [capabilities, setCapabilities] = useState<MotionCapabilities>({
    prefersReducedMotion: false,
    canHover: true,
    hasFinePointer: true,
    supports3D: true
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverQuery = window.matchMedia("(hover: hover)");
    const pointerFineQuery = window.matchMedia("(pointer: fine)");

    const updateCapabilities = () => {
      const prefersReduced = reducedMotionQuery.matches;
      const canHover = hoverQuery.matches;
      const hasFine = pointerFineQuery.matches;

      setCapabilities({
        prefersReducedMotion: prefersReduced,
        canHover,
        hasFinePointer: hasFine,
        supports3D: !prefersReduced && canHover && hasFine
      });
    };

    updateCapabilities();

    reducedMotionQuery.addEventListener("change", updateCapabilities);
    hoverQuery.addEventListener("change", updateCapabilities);
    pointerFineQuery.addEventListener("change", updateCapabilities);

    return () => {
      reducedMotionQuery.removeEventListener("change", updateCapabilities);
      hoverQuery.removeEventListener("change", updateCapabilities);
      pointerFineQuery.removeEventListener("change", updateCapabilities);
    };
  }, []);

  return capabilities;
}
