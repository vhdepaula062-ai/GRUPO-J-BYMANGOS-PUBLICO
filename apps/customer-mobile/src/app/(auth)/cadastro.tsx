import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { ApiClientError } from "@grupo-j/api-client";

export default function CadastroScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);
    try {
      await api.register({ fullName, cpf, email, phone, password, termsAccepted, privacyAccepted: termsAccepted });
      router.push({ pathname: "/(auth)/verificacao", params: { email } });
    } catch (cause) {
      setError(cause instanceof ApiClientError ? cause.message : "Não foi possível concluir o cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para contratar o Plano Motorista Grupo J.
          </Text>
        </View>

        <View style={styles.planCard}>
          <View>
            <Text style={styles.planLabel}>PLANO MOTORISTA</Text>
            <Text style={styles.planDescription}>Acesso ao aplicativo e benefícios preventivos</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>R$ 50,00</Text>
            <Text style={styles.pricePeriod}>/mês</Text>
          </View>
        </View>

        <View style={styles.form}>
          <MobileInput
            label="Nome Completo"
            placeholder="Carlos Silva"
            value={fullName}
            onChangeText={setFullName}
          />
          <MobileInput
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="numeric"
            value={cpf}
            onChangeText={setCpf}
          />
          <MobileInput
            label="E-mail"
            placeholder="carlos@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <MobileInput
            label="Celular / WhatsApp"
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <MobileInput
            label="Crie uma senha"
            placeholder="Mínimo de 8 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.termsRow} onPress={() => setTermsAccepted((value) => !value)}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              <Text style={styles.checkmark}>{termsAccepted ? "✓" : ""}</Text>
            </View>
            <Text style={styles.termsText}>Li e aceito os Termos de Uso e a Política de Privacidade.</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={{ height: 12 }} />
          <MobileButton
            label="Criar conta • Plano de R$ 50,00/mês"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onPress={handleRegister}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface.default
  },
  scroll: {
    padding: 24
  },
  header: {
    marginTop: 10,
    marginBottom: 20
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
    width: "100%"
  },
  planCard: {
    backgroundColor: tokens.colors.brand.surfaceSubtle,
    borderColor: tokens.colors.brand.primary,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  planLabel: {
    color: tokens.colors.brand.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8
  },
  planDescription: {
    color: tokens.colors.text.secondary,
    fontSize: 13,
    marginTop: 4
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 12
  },
  price: {
    color: tokens.colors.text.primary,
    fontSize: 24,
    fontWeight: "800"
  },
  pricePeriod: {
    color: tokens.colors.text.secondary,
    fontSize: 14,
    marginLeft: 4
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 10
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxChecked: {
    backgroundColor: tokens.colors.brand.primary,
    borderColor: tokens.colors.brand.primary
  },
  checkmark: {
    color: "#FFFFFF",
    fontWeight: "800"
  },
  termsText: {
    flex: 1,
    color: tokens.colors.text.secondary,
    fontSize: 13,
    lineHeight: 18
  },
  errorText: {
    color: tokens.colors.status.danger,
    fontSize: 13,
    marginTop: 10
  }
});
