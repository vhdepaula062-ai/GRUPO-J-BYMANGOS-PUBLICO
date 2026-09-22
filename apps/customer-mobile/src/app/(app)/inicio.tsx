import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";
import { BrandLogo } from "../../components/BrandLogo";

type HomeData = {
  profile: { full_name: string };
  vehicles: Array<{ plate: string; brand: string; model: string; model_year: number }>;
  subscriptions: Array<{ status: string; plan: { name: string; price_cents: number } }>;
  workshop: null | { trade_name: string; workshop_profiles: null | { rating_average: number; rating_count: number }; organization_units: Array<{ address_street: string; address_number: string; address_neighborhood: string }> };
};

export default function InicioScreen() {
  const router = useRouter();
  const loadHome = useCallback(() => api.getMe<HomeData>(), []);
  const loadPromos = useCallback(() => api.getPromotions<Array<{ id: string; title: string; description: string; image_url?: string | null; discount_percentage: number | null; workshop: { trade_name: string } }>>(), []);

  const { data, loading, error, reload: reloadHome } = useApiResource(loadHome);
  const { data: promotions, reload: reloadPromos } = useApiResource(loadPromos);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([reloadHome(), reloadPromos()]);
    setRefreshing(false);
  }, [reloadHome, reloadPromos]);

  if (loading && !refreshing) return <SafeAreaView style={styles.container}><ActivityIndicator style={{ marginTop: 48 }} /></SafeAreaView>;
  if (error || !data) return <SafeAreaView style={styles.container}><Text style={{ padding: 20, color: tokens.colors.status.danger }}>{error ?? "Dados indisponíveis"}</Text></SafeAreaView>;
  const subscription = data.subscriptions?.[0];
  const vehicle = data.vehicles?.[0];
  const workshop = data.workshop;
  const unit = workshop?.organization_units?.[0];
  const workshopProfile = workshop?.workshop_profiles;


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
        {/* Topo / Boas-vindas */}
        <BrandLogo />
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

        {/* Seção de Ofertas & Promoções em Destaque na Home */}
        {promotions && promotions.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ofertas & Descontos Exclusivos</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/promocoes")}>
                <Text style={styles.seeAllLink}>Ver todas →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
              {promotions.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.promoHomeCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(app)/promocoes")}
                >
                  <View style={styles.promoHomeImageContainer}>
                    {p.image_url ? (
                      <Image source={{ uri: p.image_url }} style={styles.promoHomeImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.promoHomePlaceholder}>
                        <Text style={{ fontSize: 24 }}>🏷️</Text>
                      </View>
                    )}
                    {p.discount_percentage ? (
                      <View style={styles.promoHomeBadge}>
                        <Text style={styles.promoHomeBadgeText}>{p.discount_percentage}% OFF</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ padding: 12 }}>
                    <Text style={styles.promoHomeWorkshop} numberOfLines={1}>
                      {p.workshop?.trade_name ?? "Oficina Credenciada"}
                    </Text>
                    <Text style={styles.promoHomeTitle} numberOfLines={2}>
                      {p.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
              {workshopProfile?.rating_count ? (
                <Text style={styles.workshopRating}>⭐ {workshopProfile.rating_average.toFixed(1)} ({workshopProfile.rating_count} avaliações)</Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity style={styles.workshopCardFooter} onPress={() => router.push("/(app)/oficinas")}>
            <Text style={styles.changeWorkshopLink}>Trocar oficina de referência →</Text>
          </TouchableOpacity>
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 12
  },
  seeAllLink: {
    fontSize: 12,
    color: tokens.colors.brand.primary,
    fontWeight: "700"
  },
  promoHomeCard: {
    width: 240,
    backgroundColor: tokens.colors.surface.default,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: tokens.colors.border.subtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  promoHomeImageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: tokens.colors.surface.subtle,
    position: "relative",
    overflow: "hidden"
  },
  promoHomeImage: {
    width: "100%",
    height: "100%"
  },
  promoHomePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },

  promoHomeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: tokens.colors.status.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  promoHomeBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800"
  },
  promoHomeWorkshop: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.brand.primary,
    textTransform: "uppercase"
  },
  promoHomeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.text.primary,
    marginTop: 2,
    lineHeight: 16
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
