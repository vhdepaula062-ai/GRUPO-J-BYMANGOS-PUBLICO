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
  initialBlur?: number;
  className?: string;
  once?: boolean;
}

export const BlurReveal: React.FC<BlurRevealProps> = ({
  children,
  delay = 0,
  duration = motionDurations.elegant,
  distance = motionDistances.small,
  initialBlur = 8,
  className = "",
  once = true,
  ...rest
}) => {
  const { prefersReducedMotion } = useMotionCapabilities();

  // Se o usuário prefere movimento reduzido, desativa o blur e o deslocamento
  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: distance, filter: `blur(${initialBlur}px)` };

  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-30px" }}
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
