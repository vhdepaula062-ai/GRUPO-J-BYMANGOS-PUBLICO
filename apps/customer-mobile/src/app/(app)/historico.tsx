import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge } from "@grupo-j/ui-mobile";
import { mockVehicle } from "@grupo-j/test-utils";
import { tokens } from "@grupo-j/design-tokens";

export default function HistoricoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Histórico de Manutenções</Text>
          <Text style={styles.subtitle}>Registro de serviços executados na rede credenciada</Text>
        </View>

        <MobileCard>
          <View style={styles.historyHeader}>
            <Text style={styles.serviceTitle}>Alinhamento 3D e Balanceamento</Text>
            <MobileBadge label="Concluído" variant="success" />
          </View>
          <Text style={styles.serviceDate}>12 de Setembro de 2026 às 10:30</Text>
          <Text style={styles.serviceWorkshop}>Auto Mecânica Modelo Barra</Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Veículo: {mockVehicle.plate} • Km: 42.150</Text>
          </View>
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
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceTitle: { fontSize: 15, fontWeight: "700", color: tokens.colors.text.primary },
  serviceDate: { fontSize: 12, color: tokens.colors.text.secondary, marginTop: 4 },
  serviceWorkshop: { fontSize: 13, color: tokens.colors.brand.primary, fontWeight: "600", marginTop: 2 },
  footer: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: tokens.colors.border.subtle },
  footerText: { fontSize: 11, color: tokens.colors.text.secondary }
});
