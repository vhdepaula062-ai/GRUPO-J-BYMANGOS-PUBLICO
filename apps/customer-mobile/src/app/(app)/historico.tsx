import React, { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

type ServiceOrder = { id: string; protocol: string; status: string; odometer_km: number | null; created_at: string; completed_at: string | null; vehicle: { plate: string }; workshop: { trade_name: string }; redemption: { benefit: { name: string } } | null };

export default function HistoricoScreen() {
  const load = useCallback(() => api.getServiceOrders<ServiceOrder[]>(), []);
  const { data, loading, error } = useApiResource(load);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Histórico de Manutenções</Text>
          <Text style={styles.subtitle}>Registro de serviços executados na rede credenciada</Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}
        {!loading && !error && data?.length === 0 ? <Text style={styles.subtitle}>Nenhuma manutenção registrada.</Text> : null}
        {(data ?? []).map((order) => <MobileCard key={order.id}>
          <View style={styles.historyHeader}>
            <Text style={styles.serviceTitle}>{order.redemption?.benefit?.name ?? order.protocol}</Text>
            <MobileBadge label={order.status === "completed" ? "Concluído" : "Em andamento"} variant={order.status === "completed" ? "success" : "info"} />
          </View>
          <Text style={styles.serviceDate}>{new Date(order.completed_at ?? order.created_at).toLocaleString("pt-BR")}</Text>
          <Text style={styles.serviceWorkshop}>{order.workshop?.trade_name ?? "Oficina credenciada"}</Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Veículo: {order.vehicle?.plate ?? "—"} • Km: {order.odometer_km?.toLocaleString("pt-BR") ?? "não informado"}</Text>
          </View>
        </MobileCard>)}
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
