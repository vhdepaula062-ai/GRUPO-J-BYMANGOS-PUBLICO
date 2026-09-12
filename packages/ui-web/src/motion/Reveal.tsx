"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { motionDurations, motionEasings, motionDistances } from "./tokens";

export interface RevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  direction = "up",
  distance = motionDistances.medium,
  delay = 0,
  duration = motionDurations.normal,
  className = "",
  once = true,
  ...rest
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
        return { x: 0, y: 0 };
    }
  };

  const initialOffset = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
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
