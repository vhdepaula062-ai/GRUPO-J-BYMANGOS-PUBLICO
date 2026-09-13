"use client";

import React from "react";
import { motion, type HTMLMotionProps, useScroll, useVelocity, useSpring, useTransform } from "motion/react";

export interface MotionBlurRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  initialBlur?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

/**
 * Componente de transição com desfoque de movimento (motion blur) na entrada por scroll.
 * Transita suavemente de filter: blur(Xpx) -> blur(0px) com amortecimento quíntico.
 */
export const MotionBlurReveal: React.FC<MotionBlurRevealProps> = ({
  children,
  delay = 0,
  duration = 0.7,
  distance = 28,
  initialBlur = 10,
  direction = "up",
  className = "",
  once = true,
  ...rest
}) => {
  const getOffset = () => {
    switch (direction) {
      case "up":
        return { x: 0, y: distance };
      case "down":
        return { x: 0, y: -distance };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        filter: `blur(${initialBlur}px)`,
        scale: 0.985
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        scale: 1
      }}
      viewport={{ once, amount: 0.15, margin: "-20px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      style={{ willChange: "transform, filter, opacity" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * Aura atmosférica dinâmica com blur sensível à velocidade instantânea do scroll.
 */
export const VelocityScrollAtmosphere: React.FC = () => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 350 });

  // Calcula intensidade do blur de movimento com base na velocidade
  const dynamicMotionBlur = useTransform(smoothVelocity, [-1500, 0, 1500], [12, 0, 12]);
  const dynamicOpacity = useTransform(smoothVelocity, [-1500, 0, 1500], [0.35, 0.05, 0.35]);
  const dynamicScale = useTransform(smoothVelocity, [-1500, 0, 1500], [1.1, 1, 1.1]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        filter: useTransform(dynamicMotionBlur, (v) => `blur(${v + 40}px)`),
        opacity: dynamicOpacity,
        scale: dynamicScale
      }}
      className="fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-500/20 via-[#034EFE]/10 to-transparent pointer-events-none z-30 transition-opacity"
    />
  );
};
