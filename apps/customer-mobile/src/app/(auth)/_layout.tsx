import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="verificacao" />
      <Stack.Screen name="recuperar-conta" />
    </Stack>
  );
}
