/**
 * Tokens semânticos exclusivos para os SaaS Web do Grupo J (admin-web e workshop-web).
 * ISOLAMENTO: Estes tokens NÃO devem ser importados por apps/customer-mobile.
 */
export const saasTokens = {
  colors: {
    brand: {
      primary: "#034EFE",
      primaryHover: "#023ECC",
      primaryActive: "#012C99",
      primarySoft: "#EFF6FF",
      primaryBorder: "#BFDBFE",
      navy: "#00091D",
      navyHover: "#0A1733",
      navyCard: "#041129",
      navyBorder: "#13254A"
    },
    surface: {
      background: "#F8FAFC",
      white: "#FFFFFF",
      subtle: "#F1F5F9",
      elevated: "#FFFFFF",
      border: "#E2E8F0",
      borderStrong: "#CBD5E1"
    },
    text: {
      primary: "#00091D",
      secondary: "#475569",
      muted: "#94A3B8",
      onDark: "#FFFFFF",
      onDarkMuted: "#94A3B8"
    },
    status: {
      success: {
        text: "#059669",
        bg: "#ECFDF5",
        border: "#A7F3D0",
        solid: "#10B981"
      },
      warning: {
        text: "#D97706",
        bg: "#FFFBEB",
        border: "#FDE68A",
        solid: "#F59E0B"
      },
      danger: {
        text: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
        solid: "#EF4444"
      },
      info: {
        text: "#034EFE",
        bg: "#EFF6FF",
        border: "#BFDBFE",
        solid: "#034EFE"
      },
      neutral: {
        text: "#475569",
        bg: "#F1F5F9",
        border: "#E2E8F0",
        solid: "#64748B"
      }
    }
  },
  radius: {
    sm: "rounded-md",     // 6px
    md: "rounded-lg",     // 8px
    lg: "rounded-xl",     // 12px
    xl: "rounded-2xl",    // 16px
    full: "rounded-full"
  },
  shadow: {
    card: "shadow-sm shadow-slate-200/50",
    elevated: "shadow-md shadow-slate-200/60",
    modal: "shadow-2xl shadow-slate-900/10"
  },
  transitions: {
    fast: "transition-all duration-150 ease-out",
    normal: "transition-all duration-200 ease-out"
  }
} as const;

export type SaasTokens = typeof saasTokens;
