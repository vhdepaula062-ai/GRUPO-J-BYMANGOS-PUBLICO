import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { tokens } from "@grupo-j/design-tokens";

export interface MobileInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={tokens.colors.text.muted}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: tokens.colors.text.primary,
    marginBottom: 6
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.surface.default
  },
  inputError: {
    borderColor: tokens.colors.status.danger
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.status.danger,
    marginTop: 4
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    marginTop: 4
  }
});
