import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

type Workshop = { id: string; trade_name: string; workshop_profiles: { rating_average: number; is_open_now: boolean } | null; organization_units: Array<{ address_street: string; address_number: string; address_neighborhood: string }> };
type AssignmentData = { assigned_workshop_id: string | null; next_workshop_change_allowed_at: string | null };

export default function OficinasScreen() {
  const load = useCallback(async () => {
    const [workshops, me] = await Promise.all([api.getWorkshops<Workshop[]>(), api.getMe<AssignmentData>()]);
    return { data: { workshops: workshops.data, me: me.data } };
  }, []);
  const { data, loading, error, reload } = useApiResource(load);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const nextAllowed = data?.me.next_workshop_change_allowed_at ? new Date(data.me.next_workshop_change_allowed_at) : null;
  const daysRemainingForChange = nextAllowed && nextAllowed > new Date() ? Math.ceil((nextAllowed.getTime() - Date.now()) / 86400000) : 0;
  const current = data?.workshops.find((item) => item.id === data.me.assigned_workshop_id);

  const selectWorkshop = async (workshopId: string) => {
    try { await api.requestWorkshopChange(workshopId); await reload(); Alert.alert("Oficina vinculada", "A nova oficina foi salva para todos os produtos do ecossistema."); }
    catch (cause) { Alert.alert("Troca não concluída", cause instanceof Error ? cause.message : "Tente novamente."); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[tokens.colors.brand.primary]}
            tintColor={tokens.colors.brand.primary}
          />
        }
      >

        <View style={styles.header}>
          <Text style={styles.title}>Centros Automotivos Credenciados</Text>
          <Text style={styles.subtitle}>
            Oficinas parceiras autorizadas a realizar seus serviços preventivos.
          </Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}

        {/* Alerta da Regra dos 30 Dias */}
        <View style={styles.cooldownAlert}>
          <View style={styles.cooldownHeader}>
            <Text style={{ fontSize: 18 }}>⏳</Text>
            <Text style={styles.cooldownTitle}>Regra de Fidelização (30 Dias)</Text>
          </View>
          <Text style={styles.cooldownDesc}>
            Para garantir a consistência do seu histórico automotivo, a troca de oficina só pode ser realizada a cada 30 dias.
            {daysRemainingForChange > 0 ? <>Faltam <Text style={{ fontWeight: "700" }}>{daysRemainingForChange} dias</Text> para você poder alterar sua oficina vinculada.</> : "Você pode escolher ou trocar sua oficina agora."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Oficina Atualmente Vinculada</Text>
        {current ? <MobileCard>
          <View style={styles.workshopItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.workshopName}>{current.trade_name}</Text>
              <Text style={styles.workshopAddress}>{current.organization_units?.[0] ? `${current.organization_units[0].address_street}, ${current.organization_units[0].address_number} — ${current.organization_units[0].address_neighborhood}` : "Endereço não informado"}</Text>
              <Text style={styles.workshopRating}>★ {current.workshop_profiles?.rating_average ?? "—"} • {current.workshop_profiles?.is_open_now ? "Aberta" : "Fechada"}</Text>
            </View>
            <MobileBadge label="Vinculada" variant="success" />
          </View>
        </MobileCard> : <Text style={styles.subtitle}>Nenhuma oficina vinculada.</Text>}

        <Text style={styles.sectionTitle}>Outras Oficinas na Rede</Text>
        {(data?.workshops ?? []).filter((item) => item.id !== current?.id).map((workshop) => <MobileCard key={workshop.id}>
          <View style={styles.workshopItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.workshopName}>{workshop.trade_name}</Text>
              <Text style={styles.workshopAddress}>{workshop.organization_units?.[0] ? `${workshop.organization_units[0].address_street}, ${workshop.organization_units[0].address_number} — ${workshop.organization_units[0].address_neighborhood}` : "Endereço não informado"}</Text>
              <Text style={styles.workshopRating}>★ {workshop.workshop_profiles?.rating_average ?? "—"}</Text>
            </View>
            <MobileButton
              label="Selecionar"
              size="sm"
              variant="outline"
              disabled={daysRemainingForChange > 0}
              onPress={() => void selectWorkshop(workshop.id)}
            />
          </View>
        </MobileCard>)}
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
