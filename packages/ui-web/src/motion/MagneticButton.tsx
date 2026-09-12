"use client";

import React, { useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { useMotionCapabilities } from "./useReducedMotion";
import { motionSprings } from "./tokens";

export interface MagneticButtonProps {
  children: React.ReactNode;
  maxDistance?: number; // máx 4 a 6px
  className?: string;
}

/**
 * Wrapper para botões primários de destaque com efeito magnético sutil.
 * Desativado automaticamente em telas touch e quando o usuário solicita redução de movimento.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  maxDistance = 5,
  className = ""
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { supports3D } = useMotionCapabilities();

  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);

  const springConfig = motionSprings.snappy;
  const x = useSpring(xRaw, springConfig);
  const y = useSpring(yRaw, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!supports3D || !buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Limita a atração máxima a poucos pixels
      const pullX = Math.max(Math.min(distanceX * 0.15, maxDistance), -maxDistance);
      const pullY = Math.max(Math.min(distanceY * 0.15, maxDistance), -maxDistance);

      xRaw.set(pullX);
      yRaw.set(pullY);
    },
    [supports3D, maxDistance, xRaw, yRaw]
  );

  const handleMouseLeave = useCallback(() => {
    xRaw.set(0);
    yRaw.set(0);
  }, [xRaw, yRaw]);

  if (!supports3D) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      <motion.div style={{ x, y }}>
        {children}
      </motion.div>
    </div>
  );
};
