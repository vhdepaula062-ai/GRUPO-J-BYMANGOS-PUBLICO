import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <Text style={styles.illustrationEmoji}>🚗</Text>
        </View>
        <Text style={styles.title}>Seu carro sempre novo e seguro</Text>
        <Text style={styles.paragraph}>
          Tenha alinhamento (convergência), balanceamento, cristalização de para-brisa e revisões
          preventivas em oficinas parceiras por apenas <Text style={styles.paragraphStrong}>R$ 50,00 por mês</Text>.
        </Text>
      </View>

      <View style={styles.footer}>
        <MobileButton
          label="Criar Minha Conta"
          variant="primary"
          size="lg"
          onPress={() => router.push("/(auth)/cadastro")}
        />
        <View style={{ height: 12 }} />
        <MobileButton
          label="Já tenho uma conta (Entrar)"
          variant="outline"
          size="lg"
          onPress={() => router.push("/(auth)/login")}
        />
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  illustrationBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: tokens.colors.brand.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24
  },
  illustrationEmoji: {
    fontSize: 54
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    textAlign: "center",
    marginBottom: 12
  },
  paragraph: {
    fontSize: 15,
    color: tokens.colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320
  },
  paragraphStrong: {
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  footer: {
    width: "100%",
    paddingBottom: 16
  }
});
