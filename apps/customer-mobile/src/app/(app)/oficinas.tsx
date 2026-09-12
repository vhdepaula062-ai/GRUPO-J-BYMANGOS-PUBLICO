import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function OficinasScreen() {
  // Simulação de estado de carência de 30 dias
  const daysRemainingForChange = 18;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Centros Automotivos Credenciados</Text>
          <Text style={styles.subtitle}>
            Oficinas parceiras autorizadas a realizar seus serviços preventivos.
          </Text>
        </View>

        {/* Alerta da Regra dos 30 Dias */}
        <View style={styles.cooldownAlert}>
          <View style={styles.cooldownHeader}>
            <Text style={{ fontSize: 18 }}>⏳</Text>
            <Text style={styles.cooldownTitle}>Regra de Fidelização (30 Dias)</Text>
          </View>
          <Text style={styles.cooldownDesc}>
            Para garantir a consistência do seu histórico automotivo, a troca de oficina só pode ser realizada a cada 30 dias.
            Faltam <Text style={{ fontWeight: "700" }}>{daysRemainingForChange} dias</Text> para você poder alterar sua oficina vinculada.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Oficina Atualmente Vinculada</Text>
        <MobileCard>
          <View style={styles.workshopItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.workshopName}>Auto Mecânica Modelo Barra</Text>
              <Text style={styles.workshopAddress}>Avenida das Américas, 1500 — Barra da Tijuca</Text>
              <Text style={styles.workshopRating}>★ 4.9 • Aberto até às 18:00</Text>
            </View>
            <MobileBadge label="Vinculada" variant="success" />
          </View>
        </MobileCard>

        <Text style={styles.sectionTitle}>Outras Oficinas na Rede</Text>
        <MobileCard>
          <View style={styles.workshopItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.workshopName}>Recreio Motors Auto Center</Text>
              <Text style={styles.workshopAddress}>Avenida das Américas, 18000 — Recreio</Text>
              <Text style={styles.workshopRating}>★ 4.8 • Aberto até às 18:00</Text>
            </View>
            <MobileButton
              label="Selecionar"
              size="sm"
              variant="outline"
              disabled={daysRemainingForChange > 0}
            />
          </View>
        </MobileCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface.subtle
  },
  scroll: {
    padding: 20
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  subtitle: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginTop: 4
  },
  cooldownAlert: {
    backgroundColor: tokens.colors.status.warningBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.status.warning,
    marginBottom: 20
  },
  cooldownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  },
  cooldownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.status.warning
  },
  cooldownDesc: {
    fontSize: 12,
    color: tokens.colors.text.primary,
    lineHeight: 18
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    marginBottom: 8,
    marginTop: 8
  },
  workshopItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  workshopName: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.text.primary
  },
  workshopAddress: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    marginTop: 2
  },
  workshopRating: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.text.primary,
    marginTop: 4
  }
});
