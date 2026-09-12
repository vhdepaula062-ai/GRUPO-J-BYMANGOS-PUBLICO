import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function VerificacaoScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(app)/inicio");
    }, 600);
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
