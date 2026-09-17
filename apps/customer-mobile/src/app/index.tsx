import React from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../providers/AuthProvider";

export default function IndexPage() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: "#00091D" }} />;
  return <Redirect href={user ? "/(app)/inicio" : "/(auth)/login"} />;
}

