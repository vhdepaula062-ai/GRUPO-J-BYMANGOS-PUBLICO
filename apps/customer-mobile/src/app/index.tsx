import { Redirect } from "expo-router";

export default function IndexPage() {
  // Redireciona para o fluxo inicial do aplicativo
  return <Redirect href="/(app)/inicio" />;
}
