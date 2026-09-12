export const colors = {
  brand: {
    primary: "#034EFE",
    primaryHover: "#023ECC",
    primaryLight: "#EBF1FF",
    navy: "#00091D",
    navyHover: "#0A1733",
    surfaceSubtle: "#F4F6FB"
  },
  surface: {
    default: "#FFFFFF",
    subtle: "#F8FAFC",
    muted: "#DEDEDE",
    dark: "#00091D",
    elevated: "#FFFFFF"
  },
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#94A3B8",
    inverse: "#FFFFFF",
    brand: "#034EFE"
  },
  status: {
    success: "#10B981",
    successBg: "#ECFDF5",
    warning: "#F59E0B",
    warningBg: "#FFFBEB",
    danger: "#EF4444",
    dangerBg: "#FEF2F2",
    info: "#034EFE",
    infoBg: "#EFF6FF"
  },
  border: {
    default: "#E2E8F0",
    subtle: "#F1F5F9",
    strong: "#CBD5E1",
    focus: "#034EFE"
  }
} as const;

export type ColorTokens = typeof colors;
