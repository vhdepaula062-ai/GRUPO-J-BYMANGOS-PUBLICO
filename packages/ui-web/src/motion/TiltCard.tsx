"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { motionTilt, motionSprings } from "./tokens";
import { useMotionCapabilities } from "./useReducedMotion";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Componente de Card com inclinação 3D sofisticada e controlada.
 * Ativado apenas em desktops com mouse de precisão.
 * Desativado automaticamente em telas touch e quando o usuário solicita redução de movimento.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = motionTilt.maxDeg,
  perspective = motionTilt.perspective,
  scale = motionTilt.scale,
  className = "",
  disabled = false,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { supports3D } = useMotionCapabilities();

  const isEnabled = !disabled && supports3D;

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const scaleRaw = useMotionValue(1);
  const zRaw = useMotionValue(0);

  const springConfig = motionSprings.tiltReturn;
  const rotateX = useSpring(rotateXRaw, springConfig);
  const rotateY = useSpring(rotateYRaw, springConfig);
  const scaleSpring = useSpring(scaleRaw, springConfig);
  const zSpring = useSpring(zRaw, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isEnabled || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Coordenadas relativas do cursor de -1 a 1 (onde 0,0 é o centro)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = (mouseX / width - 0.5) * 2;
      const yPct = (mouseY / height - 0.5) * 2;

      // Rotação no eixo X inverte com a posição Y
      rotateXRaw.set(-yPct * maxTilt);
      rotateYRaw.set(xPct * maxTilt);
      scaleRaw.set(scale);
      zRaw.set(4);
    },
    [isEnabled, maxTilt, scale, rotateXRaw, rotateYRaw, scaleRaw, zRaw]
  );

  const handleMouseEnter = useCallback(() => {
    if (!isEnabled) return;
    setIsHovered(true);
  }, [isEnabled]);

  const handleMouseLeave = useCallback(() => {
    if (!isEnabled) return;
    setIsHovered(false);
    rotateXRaw.set(0);
    rotateYRaw.set(0);
    scaleRaw.set(1);
    zRaw.set(0);
  }, [isEnabled, rotateXRaw, rotateYRaw, scaleRaw, zRaw]);

  if (!isEnabled) {
    return (
      <div
        className={`transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      style={{ perspective: `${perspective}px` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${className}`}
      {...rest}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleSpring,
          z: zSpring,
          transformStyle: "preserve-3d"
        }}
        className={`w-full h-full transition-shadow duration-300 ${
          isHovered ? "shadow-xl shadow-blue-500/10" : ""
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
};
