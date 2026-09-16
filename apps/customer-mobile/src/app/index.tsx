import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../providers/AuthProvider";

export default function IndexPage() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>;
  return <Redirect href={user ? "/(app)/inicio" : "/(auth)/login"} />;
}
