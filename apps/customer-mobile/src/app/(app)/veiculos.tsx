import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { mockVehicle } from "@grupo-j/test-utils";
import { tokens } from "@grupo-j/design-tokens";

export default function VeiculosScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <div>
            <Text style={styles.title}>Meus Veículos</Text>
            <Text style={styles.subtitle}>Frota cadastrada na sua assinatura Grupo J.</Text>
          </div>
          <MobileButton label="+ Adicionar" size="sm" variant="primary" />
        </View>

        <MobileCard>
          <View style={styles.vehicleHeader}>
            <div>
              <Text style={styles.plateText}>{mockVehicle.plate}</Text>
              <Text style={styles.modelText}>{mockVehicle.brand} {mockVehicle.model}</Text>
            </div>
            <MobileBadge label="Principal" variant="success" />
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>Ano: {mockVehicle.modelYear}/{mockVehicle.manufactureYear}</Text>
            <Text style={styles.detailItem}>Cor: {mockVehicle.color}</Text>
            <Text style={styles.detailItem}>Renavam: {mockVehicle.renavamMasked}</Text>
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
    alignItems: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.text.primary
  },
  subtitle: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginTop: 2
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  plateText: {
    fontSize: 20,
    fontWeight: "900",
    color: tokens.colors.text.primary
  },
  modelText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginTop: 2
  },
  detailsRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle,
    gap: 4
  },
  detailItem: {
    fontSize: 12,
    color: tokens.colors.text.secondary
  }
});
