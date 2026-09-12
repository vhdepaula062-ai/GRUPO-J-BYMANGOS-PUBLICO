import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps
} from "react-native";
import { tokens } from "@grupo-j/design-tokens";

export interface MobileButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryContainer;
      case "outline":
        return styles.outlineContainer;
      case "danger":
        return styles.dangerContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || isLoading) }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? tokens.colors.brand.primary : "#FFFFFF"}
          size="small"
        />
      ) : (
        <Text style={[styles.textBase, getTextStyle()]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 44 // Alvo de toque mínimo recomendado
  },
  primaryContainer: {
    backgroundColor: tokens.colors.brand.primary
  },
  secondaryContainer: {
    backgroundColor: tokens.colors.brand.navy
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: tokens.colors.border.default
  },
  dangerContainer: {
    backgroundColor: tokens.colors.status.danger
  },
  sizeSm: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  textBase: {
    fontWeight: "600",
    fontSize: 15
  },
  primaryText: {
    color: "#FFFFFF"
  },
  outlineText: {
    color: tokens.colors.text.primary
  },
  disabled: {
    opacity: 0.5
  }
});
