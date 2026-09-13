"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { motionDurations, motionEasings, motionDistances } from "./tokens";
import { useMotionCapabilities } from "./useReducedMotion";

export interface BlurRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  initialBlur?: number; // mantido para compatibilidade de interface, sem aplicar blur no texto
  className?: string;
  once?: boolean;
}

/**
 * Componente de revelação com transição suave (Fade Up).
 * Otimizado para máxima nitidez: NÃO aplica desfoque CSS no texto, garantindo que
 * todos os títulos e parágrafos permaneçam 100% nítidos, escuros e legíveis.
 */
export const BlurReveal: React.FC<BlurRevealProps> = ({
  children,
  delay = 0,
  duration = motionDurations.normal,
  distance = motionDistances.small,
  className = "",
  once = true,
  ...rest
}) => {
  const { prefersReducedMotion } = useMotionCapabilities();

  const initial = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 0, y: distance };

  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: motionEasings.standard
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
