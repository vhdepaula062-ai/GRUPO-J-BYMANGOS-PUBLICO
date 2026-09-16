import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../lib/api";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../providers/AuthProvider";

export default function VerificacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { restore } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post<{ accessToken: string; refreshToken: string }, { email: string; code: string }>("/api/v1/auth/verify", { email: params.email ?? "", code });
      await Promise.all([SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.data.accessToken), SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.data.refreshToken)]);
      await restore();
      router.replace("/(app)/inicio");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Código inválido."); }
    finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verificação de Segurança</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de confirmação por SMS/E-mail para validar seu contato.
        </Text>
      </View>

      <View style={styles.form}>
        <MobileInput
          label="Código de 6 dígitos"
          placeholder="123456"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}

        <View style={{ height: 16 }} />
        <MobileButton
          label="Confirmar e Concluir"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onPress={handleVerify}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface.default,
    padding: 24
  },
  header: {
    marginTop: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginTop: 6,
    lineHeight: 20
  },
  form: {
    marginTop: 32
  }
});
