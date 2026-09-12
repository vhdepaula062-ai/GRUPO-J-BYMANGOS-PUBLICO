import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function PromocoesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Ofertas e Promoções</Text>
          <Text style={styles.subtitle}>Descontos exclusivos oferecidos pelas oficinas credenciadas</Text>
        </View>

        <MobileCard>
          <View style={styles.promoHeader}>
            <Text style={styles.workshopName}>Auto Mecânica Modelo Barra</Text>
            <MobileBadge label="20% OFF" variant="danger" />
          </View>
          <Text style={styles.promoTitle}>Troca de Pastilhas de Freio</Text>
          <Text style={styles.promoDesc}>
            Desconto de 20% na mão de obra e peças para substituição de pastilhas dianteiras.
          </Text>
          <Text style={styles.promoValid}>Válido até 31/10/2026</Text>
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
  promoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  workshopName: { fontSize: 12, fontWeight: "700", color: tokens.colors.brand.primary, textTransform: "uppercase" },
  promoTitle: { fontSize: 16, fontWeight: "800", color: tokens.colors.text.primary, marginTop: 4 },
  promoDesc: { fontSize: 13, color: tokens.colors.text.secondary, marginTop: 4, lineHeight: 18 },
  promoValid: { fontSize: 11, color: tokens.colors.text.muted, marginTop: 8 }
});
