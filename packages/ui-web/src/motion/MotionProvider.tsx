"use client";

import React from "react";
import { MotionConfig } from "motion/react";

export interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Provider global de Motion Design para aplicações web Grupo J.
 * Configura o comportamento nativo de acessibilidade (reducedMotion="user"),
 * garantindo que qualquer animação em motion/react respeite a preferência do sistema.
 */
export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
};
