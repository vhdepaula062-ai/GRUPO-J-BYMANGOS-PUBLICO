import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(app)/inicio");
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Acesse sua assinatura automotiva</Text>
      </View>

      <View style={styles.form}>
        <MobileInput
          label="E-mail"
          placeholder="seu.email@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <MobileInput
          label="Senha"
          placeholder="••••••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/(auth)/recuperar-conta")}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
        <MobileButton
          label="Entrar"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onPress={handleLogin}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não é assinante? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/cadastro")}>
          <Text style={styles.footerLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface.default,
    padding: 24,
    justifyContent: "space-between"
  },
  header: {
    marginTop: 20
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginTop: 4
  },
  form: {
    width: "100%",
    marginVertical: 24
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 16
  },
  forgotPasswordText: {
    fontSize: 13,
    color: tokens.colors.brand.primary,
    fontWeight: "600"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 16
  },
  footerText: {
    fontSize: 14,
    color: tokens.colors.text.secondary
  },
  footerLink: {
    fontSize: 14,
    color: tokens.colors.brand.primary,
    fontWeight: "700"
  }
});
