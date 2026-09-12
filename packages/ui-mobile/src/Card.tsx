import React from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";
import { tokens } from "@grupo-j/design-tokens";

export interface MobileCardProps extends ViewProps {
  children: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

export interface MobileBadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export const MobileBadge: React.FC<MobileBadgeProps> = ({ label, variant = "neutral" }) => {
  const getStyles = () => {
    switch (variant) {
      case "success":
        return { bg: tokens.colors.status.successBg, text: tokens.colors.status.success };
      case "warning":
        return { bg: tokens.colors.status.warningBg, text: tokens.colors.status.warning };
      case "danger":
        return { bg: tokens.colors.status.dangerBg, text: tokens.colors.status.danger };
      case "info":
        return { bg: tokens.colors.status.infoBg, text: tokens.colors.status.info };
      default:
        return { bg: tokens.colors.surface.subtle, text: tokens.colors.text.secondary };
    }
  };

  const { bg, text } = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export interface MobileEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({
  title,
  description,
  action
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface.default,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 6
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: tokens.colors.border.default,
    backgroundColor: tokens.colors.surface.subtle
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.text.primary,
    marginBottom: 4,
    textAlign: "center"
  },
  emptyDescription: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    textAlign: "center",
    lineHeight: 18
  },
  emptyAction: {
    marginTop: 16
  }
});
