"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView } from "motion/react";
import { useMotionCapabilities } from "./useReducedMotion";

export interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // em segundos
  decimals?: number;
  formatThousands?: boolean;
  className?: string;
}

/**
 * Contador numérico animado com garantia absoluta de acessibilidade e SEO.
 * O valor final existe no DOM e é anunciado uma única vez para leitores de tela.
 * O count-up visual ocorre apenas quando em viewport e se reduced-motion estiver desativado.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  decimals = 0,
  formatThousands = true,
  className = ""
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });
  const { prefersReducedMotion } = useMotionCapabilities();

  const [displayValue, setDisplayValue] = useState<number>(() => {
    return prefersReducedMotion ? value : 0;
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    if (!isInView) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const startValue = 0;
    const endValue = value;
    const durationMs = duration * 1000;

    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, value, duration, prefersReducedMotion]);

  const formatNumber = (num: number): string => {
    let fixed = num.toFixed(decimals);
    if (formatThousands) {
      const parts = fixed.split(".");
      if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        fixed = parts.join(",");
      }
    }
    return fixed;
  };

  const finalFormatted = formatNumber(value);
  const currentFormatted = formatNumber(displayValue);

  return (
    <span
      ref={containerRef}
      className={`inline-block font-inherit ${className}`}
      aria-label={`${prefix}${finalFormatted}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {currentFormatted}
        {suffix}
      </span>
    </span>
  );
};
