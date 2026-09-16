import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { ApiClientError } from "@grupo-j/api-client";
import { useAuth } from "../../providers/AuthProvider";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(app)/inicio");
    } catch (cause) {
      setError(cause instanceof ApiClientError ? cause.message : "Não foi possível entrar. Confira sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>J</Text>
        </View>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre para acessar sua assinatura e seus benefícios automotivos.</Text>
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
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
        <Text style={styles.planPrice}>Plano Motorista • R$ 50,00/mês</Text>
        <View style={styles.signupRow}>
          <Text style={styles.footerText}>Ainda não é assinante? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/cadastro")}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 20,
    alignItems: "center"
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: tokens.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800"
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20
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
  errorText: {
    color: tokens.colors.status.danger,
    fontSize: 13,
    marginTop: 8
  },
  forgotPasswordText: {
    fontSize: 13,
    color: tokens.colors.brand.primary,
    fontWeight: "600"
  },
  footer: {
    alignItems: "center",
    paddingBottom: 16
  },
  planPrice: {
    fontSize: 14,
    color: tokens.colors.text.primary,
    fontWeight: "700",
    marginBottom: 12
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
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
