import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function NotificacoesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.subtitle}>Avisos sobre seu plano, benefícios e manutenções</Text>
        </View>

        <MobileCard>
          <Text style={styles.notifTitle}>Renovação de Assinatura Confirmada</Text>
          <Text style={styles.notifDesc}>
            Seu pagamento de R$ 50,00 foi processado com sucesso. Seus benefícios do novo ciclo já estão liberados!
          </Text>
          <Text style={styles.notifTime}>Há 2 horas</Text>
        </MobileCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.surface.subtle },
  scroll: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "800", color: tokens.colors.text.primary },
  subtitle: { fontSize: 13, color: tokens.colors.text.secondary, marginTop: 2 },
  notifTitle: { fontSize: 15, fontWeight: "700", color: tokens.colors.text.primary },
  notifDesc: { fontSize: 13, color: tokens.colors.text.secondary, marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, color: tokens.colors.text.muted, marginTop: 8 }
});
