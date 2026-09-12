import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function RecuperarContaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recuperação de Acesso</Text>
        <Text style={styles.subtitle}>
          Informe o e-mail cadastrado para receber as instruções de redefinição segura de senha.
        </Text>
      </View>

      <View style={styles.form}>
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>E-mail de Recuperação Enviado!</Text>
            <Text style={styles.successText}>
              Verifique sua caixa de entrada e siga as instruções para redefinir seu acesso.
            </Text>
            <View style={{ height: 20 }} />
            <MobileButton
              label="Voltar para o Login"
              variant="outline"
              onPress={() => router.replace("/(auth)/login")}
            />
          </View>
        ) : (
          <>
            <MobileInput
              label="E-mail"
              placeholder="seu.email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <View style={{ height: 16 }} />
            <MobileButton
              label="Enviar Link de Recuperação"
              variant="primary"
              size="lg"
              onPress={() => setSent(true)}
            />
          </>
        )}
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
  },
  successBox: {
    padding: 20,
    backgroundColor: tokens.colors.status.successBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.status.success
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.status.success,
    marginBottom: 6
  },
  successText: {
    fontSize: 14,
    color: tokens.colors.text.primary,
    lineHeight: 20
  }
});
