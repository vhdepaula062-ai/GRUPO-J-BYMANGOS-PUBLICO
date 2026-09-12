import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function CadastroScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/(auth)/verificacao");
    }, 700);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastre-se</Text>
          <Text style={styles.subtitle}>
            Plano Motorista Grupo J: R$ 50,00/mês com benefícios preventivos
          </Text>
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
            label="Placa do Veículo Principal"
            placeholder="ABC1D23"
            autoCapitalize="characters"
            value={plate}
            onChangeText={setPlate}
          />

          <View style={{ height: 12 }} />
          <MobileButton
            label="Continuar para Pagamento"
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
  }
});
