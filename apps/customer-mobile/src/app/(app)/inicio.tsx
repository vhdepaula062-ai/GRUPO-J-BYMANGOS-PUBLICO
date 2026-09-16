import React, { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

type HomeData = {
  profile: { full_name: string };
  vehicles: Array<{ plate: string; brand: string; model: string; model_year: number }>;
  subscriptions: Array<{ status: string; plan: { name: string; price_cents: number } }>;
  workshop: null | { trade_name: string; workshop_profiles: null | { rating_average: number; rating_count: number }; organization_units: Array<{ address_street: string; address_number: string; address_neighborhood: string }> };
};

export default function InicioScreen() {
  const router = useRouter();
  const load = useCallback(() => api.getMe<HomeData>(), []);
  const { data, loading, error } = useApiResource(load);
  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator style={{ marginTop: 48 }} /></SafeAreaView>;
  if (error || !data) return <SafeAreaView style={styles.container}><Text style={{ padding: 20, color: tokens.colors.status.danger }}>{error ?? "Dados indisponíveis"}</Text></SafeAreaView>;
  const subscription = data.subscriptions?.[0];
  const vehicle = data.vehicles?.[0];
  const workshop = data.workshop;
  const unit = workshop?.organization_units?.[0];
  const workshopProfile = workshop?.workshop_profiles;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Topo / Boas-vindas */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {data.profile.full_name.split(" ")[0]} 👋</Text>
            <Text style={styles.planInfo}>{subscription?.plan?.name ?? "Plano ainda não contratado"}</Text>
          </View>
          <MobileBadge label={subscription?.status === "active" ? "Ativo" : "Pendente"} variant={subscription?.status === "active" ? "success" : "warning"} />
        </View>

        {/* Card de Ação Rápida de Resgate */}
        <View style={styles.voucherCta}>
          <Text style={styles.voucherCtaTitle}>Precisa de Manutenção Preventiva?</Text>
          <Text style={styles.voucherCtaDesc}>
            Gere seu voucher temporário para apresentar na oficina credenciada.
          </Text>
          <View style={{ height: 12 }} />
          <MobileButton
            label="⚡ Gerar Voucher / QR Code"
            variant="secondary"
            onPress={() => router.push("/(app)/beneficios")}
          />
        </View>

        {/* Card da Oficina Vinculada */}
        <Text style={styles.sectionTitle}>Sua Oficina de Referência</Text>
        <MobileCard>
          <View style={styles.workshopCardContent}>
            <View style={styles.workshopIcon}>
              <Text style={{ fontSize: 24 }}>🔧</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.workshopName}>{workshop?.trade_name ?? "Escolha uma oficina credenciada"}</Text>
              <Text style={styles.workshopAddress}>
                {unit ? `${unit.address_street}, ${unit.address_number} — ${unit.address_neighborhood}` : "Nenhuma oficina vinculada"}
              </Text>
              {workshopProfile ? <Text style={styles.workshopRating}>★ {workshopProfile.rating_average} ({workshopProfile.rating_count} avaliações)</Text> : null}
            </View>
          </View>
          <View style={styles.workshopCardFooter}>
            <TouchableOpacity onPress={() => router.push("/(app)/oficinas")}>
              <Text style={styles.changeWorkshopLink}>Trocar oficina de referência →</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>

        {/* Card do Veículo */}
        <Text style={styles.sectionTitle}>Veículo Cadastrado</Text>
        <MobileCard>
          <View style={styles.vehicleRow}>
            <View>
              <Text style={styles.vehiclePlate}>{vehicle?.plate ?? "Nenhum veículo"}</Text>
              <Text style={styles.vehicleModel}>{vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.model_year})` : "Cadastre um veículo para usar benefícios"}</Text>
            </View>
            <MobileBadge label={subscription?.status === "active" && vehicle ? "Elegível" : "Pendente"} variant={subscription?.status === "active" && vehicle ? "info" : "neutral"} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  planInfo: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginTop: 2
  },
  voucherCta: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: tokens.colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  voucherCtaTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700"
  },
  voucherCtaDesc: {
    color: "#E2E8F0",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    marginBottom: 8,
    marginTop: 12
  },
  workshopCardContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  workshopIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: tokens.colors.brand.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center"
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
  },
  workshopCardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle
  },
  changeWorkshopLink: {
    fontSize: 12,
    color: tokens.colors.brand.primary,
    fontWeight: "600"
  },
  vehicleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  vehiclePlate: {
    fontSize: 17,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  vehicleModel: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginTop: 2
  }
});
