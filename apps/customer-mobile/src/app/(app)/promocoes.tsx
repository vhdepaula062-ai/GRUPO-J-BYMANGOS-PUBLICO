import React, { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

type Promotion = {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  discount_percentage: number | null;
  price_cents: number | null;
  end_date: string;
  workshop: { trade_name: string };
};

export default function PromocoesScreen() {
  const load = useCallback(() => api.getPromotions<Promotion[]>(), []);
  const { data, loading, error } = useApiResource(load);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Ofertas e Promoções</Text>
          <Text style={styles.subtitle}>Descontos exclusivos oferecidos pelas oficinas credenciadas</Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}
        {!loading && !error && data?.length === 0 ? <Text style={styles.subtitle}>Nenhuma promoção ativa no momento.</Text> : null}
        {(data ?? []).map((promotion) => (
          <MobileCard key={promotion.id} style={styles.card}>
            {promotion.image_url ? (
              <Image source={{ uri: promotion.image_url }} style={styles.promoImage} resizeMode="cover" />
            ) : null}
            <View style={styles.cardContent}>
              <View style={styles.promoHeader}>
                <Text style={styles.workshopName}>{promotion.workshop?.trade_name ?? "Oficina credenciada"}</Text>
                {promotion.discount_percentage ? <MobileBadge label={`${promotion.discount_percentage}% OFF`} variant="danger" /> : null}
              </View>
              <Text style={styles.promoTitle}>{promotion.title}</Text>
              <Text style={styles.promoDesc}>{promotion.description}</Text>
              <Text style={styles.promoValid}>Válido até {new Date(`${promotion.end_date}T12:00:00`).toLocaleDateString("pt-BR")}</Text>
            </View>
          </MobileCard>
        ))}
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
  card: { padding: 0, overflow: "hidden", marginBottom: 16 },
  promoImage: { width: "100%", height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  cardContent: { padding: 16 },
  promoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  workshopName: { fontSize: 12, fontWeight: "700", color: tokens.colors.brand.primary, textTransform: "uppercase" },
  promoTitle: { fontSize: 16, fontWeight: "800", color: tokens.colors.text.primary, marginTop: 4 },
  promoDesc: { fontSize: 13, color: tokens.colors.text.secondary, marginTop: 4, lineHeight: 18 },
  promoValid: { fontSize: 11, color: tokens.colors.text.muted, marginTop: 8 }
});
