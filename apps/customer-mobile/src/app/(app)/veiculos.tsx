import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileButton, MobileInput } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

type Vehicle = { id: string; plate: string; brand: string; model: string; model_year: number; manufacture_year: number; color: string; renavam_masked: string | null };

export default function VeiculosScreen() {
  const load = useCallback(() => api.getVehicles<Vehicle[]>(), []);
  const { data: vehicles, loading, error, reload } = useApiResource(load);
  const [editing,setEditing]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [manufacture,setManufacture]=useState("");
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState(""); const [brand, setBrand] = useState(""); const [model, setModel] = useState(""); const [year, setYear] = useState(""); const [color, setColor] = useState("");
  const saveVehicle = async () => {
    setBusy(true);
    try {
      const values={brand,model,modelYear:Number(year),manufactureYear:Number(manufacture||year),color};
      if(editing)await api.updateVehicle(editing,values);else await api.createVehicle({plate,...values});
      setEditing(null);setManufacture("");
      setShowForm(false); setPlate(""); setBrand(""); setModel(""); setYear(""); setColor(""); await reload();
    } catch (cause) { Alert.alert("Veículo não cadastrado", cause instanceof Error ? cause.message : "Confira os dados."); }finally{setBusy(false);}
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meus Veículos</Text>
            <Text style={styles.subtitle}>Frota cadastrada na sua assinatura Grupo J.</Text>
          </View>
          <MobileButton label={showForm ? "Cancelar" : "+ Adicionar"} size="sm" variant="primary" onPress={() => {setEditing(null);setPlate("");setBrand("");setModel("");setYear("");setManufacture("");setColor("");setShowForm((value)=>!value);}} />
        </View>
        {showForm ? <MobileCard>
          <MobileInput editable={!editing} label="Placa" value={plate} onChangeText={setPlate} autoCapitalize="characters" placeholder="ABC1D23" />
          <MobileInput label="Marca" value={brand} onChangeText={setBrand} placeholder="Volkswagen" />
          <MobileInput label="Modelo" value={model} onChangeText={setModel} placeholder="Gol" />
          <MobileInput label="Ano" value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2024" />
          <MobileInput label="Ano de fabricação" value={manufacture} onChangeText={setManufacture} keyboardType="numeric"/>
          <MobileInput label="Cor" value={color} onChangeText={setColor} placeholder="Prata" />
          <MobileButton label="Salvar veículo" isLoading={busy} variant="primary" onPress={() => void saveVehicle()} />
        </MobileCard> : null}
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}
        {!loading && !error && vehicles?.length === 0 ? <Text style={styles.subtitle}>Nenhum veículo cadastrado.</Text> : null}
        {(vehicles ?? []).map((vehicle) => <MobileCard key={vehicle.id}>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.plateText}>{vehicle.plate}</Text>
              <Text style={styles.modelText}>{vehicle.brand} {vehicle.model}</Text>
            </View>

          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>Ano: {vehicle.model_year}/{vehicle.manufacture_year}</Text>
            <Text style={styles.detailItem}>Cor: {vehicle.color}</Text>
            <Text style={styles.detailItem}>Renavam: {vehicle.renavam_masked ?? "Não informado"}</Text>
          </View>
          <MobileButton label="Editar" variant="outline" onPress={()=>{setEditing(vehicle.id);setPlate(vehicle.plate);setBrand(vehicle.brand);setModel(vehicle.model);setYear(String(vehicle.model_year));setManufacture(String(vehicle.manufacture_year));setColor(vehicle.color);setShowForm(true);}}/>
          <MobileButton label="Desativar veículo" variant="outline" onPress={()=>Alert.alert("Desativar veículo","O histórico será preservado. Este veículo não poderá emitir novos vouchers.",[{text:"Voltar",style:"cancel"},{text:"Desativar",onPress:async()=>{try{await api.updateVehicle(vehicle.id,{isActive:false});await reload();}catch(e){Alert.alert("Não foi possível desativar",e instanceof Error?e.message:"Tente novamente.");}}}])}/>
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
