import React, { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { AnimatedSplashScreen } from "../components/AnimatedSplashScreen";

// Previne o auto-hide do splash nativo até a camada React Native estar montada
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootContent() {
  const { isInitialized } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <StatusBar style="light" backgroundColor="#00091D" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#00091D" } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>

      {showSplash && (
        <AnimatedSplashScreen
          isReady={isInitialized}
          onFinish={() => setShowSplash(false)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

