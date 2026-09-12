import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { tokens } from "@grupo-j/design-tokens";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>J</Text>
      </View>
      <Text style={styles.title}>GRUPO J</Text>
      <Text style={styles.subtitle}>Prevenção e Manutenção Automotiva</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.brand.navy,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: tokens.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1
  },
  subtitle: {
    color: tokens.colors.text.muted,
    fontSize: 14,
    marginTop: 6
  }
});
