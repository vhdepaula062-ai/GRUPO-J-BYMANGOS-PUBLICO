import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

type Vehicle = { id: string; plate: string; brand: string; model: string; model_year: number; manufacture_year: number; color: string; renavam_masked: string | null };

export default function VeiculosScreen() {
  const load = useCallback(() => api.getVehicles<Vehicle[]>(), []);
  const { data: vehicles, loading, error, reload } = useApiResource(load);
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState(""); const [brand, setBrand] = useState(""); const [model, setModel] = useState(""); const [year, setYear] = useState(""); const [color, setColor] = useState("");
  const saveVehicle = async () => {
    try {
      await api.createVehicle({ plate, brand, model, modelYear: Number(year), manufactureYear: Number(year), color });
      setShowForm(false); setPlate(""); setBrand(""); setModel(""); setYear(""); setColor(""); await reload();
    } catch (cause) { Alert.alert("Veículo não cadastrado", cause instanceof Error ? cause.message : "Confira os dados."); }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meus Veículos</Text>
            <Text style={styles.subtitle}>Frota cadastrada na sua assinatura Grupo J.</Text>
          </View>
          <MobileButton label={showForm ? "Cancelar" : "+ Adicionar"} size="sm" variant="primary" onPress={() => setShowForm((value) => !value)} />
        </View>
        {showForm ? <MobileCard>
          <MobileInput label="Placa" value={plate} onChangeText={setPlate} autoCapitalize="characters" placeholder="ABC1D23" />
          <MobileInput label="Marca" value={brand} onChangeText={setBrand} placeholder="Volkswagen" />
          <MobileInput label="Modelo" value={model} onChangeText={setModel} placeholder="Gol" />
          <MobileInput label="Ano" value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2024" />
          <MobileInput label="Cor" value={color} onChangeText={setColor} placeholder="Prata" />
          <MobileButton label="Salvar veículo" variant="primary" onPress={() => void saveVehicle()} />
        </MobileCard> : null}
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}
        {!loading && !error && vehicles?.length === 0 ? <Text style={styles.subtitle}>Nenhum veículo cadastrado.</Text> : null}
        {(vehicles ?? []).map((vehicle, index) => <MobileCard key={vehicle.id}>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.plateText}>{vehicle.plate}</Text>
              <Text style={styles.modelText}>{vehicle.brand} {vehicle.model}</Text>
            </View>
            {index === 0 ? <MobileBadge label="Principal" variant="success" /> : null}
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>Ano: {vehicle.model_year}/{vehicle.manufacture_year}</Text>
            <Text style={styles.detailItem}>Cor: {vehicle.color}</Text>
            <Text style={styles.detailItem}>Renavam: {vehicle.renavam_masked ?? "Não informado"}</Text>
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
