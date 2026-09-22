import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton, MobileEmptyState } from "@grupo-j/ui-mobile";
import { useRouter } from "expo-router";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

interface ServiceBenefit {
  id: string;
  total_quantity: number;
  available_quantity: number;
  benefit: { id: string; name: string; description: string; periodicity: string };
}
type Vehicle = { id: string;plate:string;model:string };

export default function BeneficiosScreen() {
  const router = useRouter();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [selectedVehicle,setSelectedVehicle]=useState<string|null>(null);
  const [activeVoucher, setActiveVoucher] = useState<{
    code: string;
    benefitName: string;
    secondsRemaining: number;
  } | null>(null);
  const load = useCallback(async () => {
    const [benefits, vehicles] = await Promise.all([api.getBenefits<ServiceBenefit[]>(), api.getVehicles<Vehicle[]>()]);
    return { data: { benefits: benefits.data, vehicles: vehicles.data } };
  }, []);
  const { data, loading, error, reload } = useApiResource(load);
  const [refreshing, setRefreshing] = useState(false);
  const vehicles = data?.vehicles ?? [];
  const benefits = data?.benefits ?? [];

  useEffect(() => {
    if (data && !data.vehicles.some(vehicle => vehicle.id === selectedVehicle)) {
      setSelectedVehicle(data.vehicles[0]?.id ?? null);
    }
  }, [data, selectedVehicle]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  useEffect(() => {
    if (!activeVoucher || activeVoucher.secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setActiveVoucher((prev) =>
        prev && prev.secondsRemaining > 0
          ? { ...prev, secondsRemaining: prev.secondsRemaining - 1 }
          : null
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [activeVoucher]);

  const generateVoucher = async (benefit: ServiceBenefit, selected?:Vehicle) => {
    if (generatingId || benefit.available_quantity <= 0) return;
    const vehicle = selected??data?.vehicles.find(v=>v.id===selectedVehicle)??data?.vehicles[0];
    if (!vehicle) return Alert.alert("Veículo necessário", "Cadastre um veículo antes de gerar o voucher.");
    setGeneratingId(benefit.id);
    try {
      const response = await api.post<{ voucherCode: string; expiresAt: string }, { vehicleId: string; benefitDefinitionId: string }>("/api/v1/benefits", { vehicleId: vehicle.id, benefitDefinitionId: benefit.benefit.id });
      setActiveVoucher({ code: response.data.voucherCode, benefitName: benefit.benefit.name, secondsRemaining: Math.max(0, Math.floor((new Date(response.data.expiresAt).getTime() - Date.now()) / 1000)) });
    } catch (cause) { Alert.alert("Voucher não gerado", cause instanceof Error ? cause.message : "Tente novamente."); }
    finally { setGeneratingId(null); }
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
          <Text style={styles.title}>Serviços Inclusos no Plano</Text>
          <Text style={styles.subtitle}>
            Consulte seu saldo, a carência e a vigência de cada benefício
          </Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        {error ? <View><Text accessibilityRole="alert" style={{ color: tokens.colors.status.danger }}>{error}</Text><MobileButton label="Tentar novamente" variant="outline" onPress={()=>void reload()}/></View> : null}

        <Text style={styles.sectionTitle}>Veículo para o atendimento</Text>
        {!loading && !error && vehicles.length === 0 ? <MobileCard><MobileEmptyState title="Nenhum veículo cadastrado" description="Cadastre seu veículo para utilizar os benefícios disponíveis na sua conta." action={<MobileButton label="Cadastrar veículo" onPress={()=>router.push("/(app)/veiculos")}/>}/></MobileCard> : null}
        {(data?.vehicles??[]).map((v,i)=><MobileButton key={v.id} label={(selectedVehicle===v.id||(!selectedVehicle&&i===0)?"✓ ":"")+v.plate+" — "+v.model} variant="outline" onPress={()=>setSelectedVehicle(v.id)}/>)}
        {/* Modal / Card de Voucher Ativo */}
        {activeVoucher && (
          <View style={styles.voucherModal}>
            <View style={styles.voucherHeader}>
              <View>
                <Text style={styles.voucherTitle}>{activeVoucher.benefitName}</Text>
                <Text style={styles.voucherSubtitle}>Voucher temporário</Text>
              </View>
              <MobileBadge
                label={`Expira em ${activeVoucher.secondsRemaining}s`}
                variant={activeVoucher.secondsRemaining < 30 ? "danger" : "warning"}
              />
            </View>

            <View style={styles.qrPlaceholder}>
              <Text style={{ fontSize: 36, marginBottom: 4 }}>📱</Text>
              <Text style={styles.voucherToken}>{activeVoucher.code}</Text>
              <Text style={styles.voucherSignature}>Token único emitido pelo servidor</Text>
              <Text style={styles.qrSub}>
                Apresente este código ao atendente da oficina credenciada. Válido para 1 único resgate.
              </Text>
            </View>
          </View>
        )}

        {/* Lista dos 4 Serviços do Plano */}
        <Text style={styles.sectionTitle}>Saldo e Disponibilidade de Serviços</Text>
        {!loading && !error && benefits.length === 0 ? <MobileCard><MobileEmptyState title="Nenhum benefício disponível" description="Os benefícios dependem do plano e da vigência da sua assinatura. Consulte a situação no Perfil. Se precisar de ajuda, abra um protocolo em Atendimento." action={<MobileButton label="Consultar meu perfil" variant="outline" onPress={()=>router.push("/(app)/perfil")}/>}/></MobileCard> : null}
        <View style={styles.list}>
          {(data?.benefits ?? []).map((benefit) => (
            <MobileCard key={benefit.id}>
              <View style={styles.benefitRow}>
                <View style={styles.benefitLeft}>
                  <Text style={styles.benefitIcon}>🔧</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.benefitName}>{benefit.benefit.name}</Text>
                    <Text style={styles.benefitPeriod}>{benefit.benefit.periodicity}</Text>
                    <Text style={styles.benefitRule}>{benefit.benefit.description}</Text>
                  </View>
                </View>
                <MobileBadge
                  label={`${benefit.available_quantity}/${benefit.total_quantity} Disp.`}
                  variant={benefit.available_quantity > 0 ? "success" : "neutral"}
                />
              </View>
              <View style={styles.cardFooter}>
                <MobileButton
                  label={benefit.available_quantity <= 0 ? "Saldo esgotado neste período" : "Gerar voucher de atendimento"}
                  variant="primary"
                  size="sm"
                  disabled={!vehicles.length || benefit.available_quantity <= 0 || generatingId !== null}
                  isLoading={generatingId === benefit.id}
                  onPress={() => void generateVoucher(benefit)}
                />
              </View>
            </MobileCard>
          ))}
        </View>

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
    padding: 20,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center"
  },
  header: {
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
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    marginBottom: 12
  },
  voucherModal: {
    backgroundColor: tokens.colors.brand.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },
  voucherTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  voucherSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2
  },
  qrPlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  voucherToken: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    color: tokens.colors.brand.primary
  },
  voucherSignature: {
    fontSize: 11,
    fontFamily: "monospace",
    color: tokens.colors.text.secondary,
    marginTop: 4
  },
  qrSub: {
    fontSize: 11,
    color: tokens.colors.text.secondary,
    textAlign: "center",
    marginTop: 8
  },
  list: {
    gap: 12
  },
  benefitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  benefitLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
    marginRight: 8
  },
  benefitIcon: {
    fontSize: 24
  },
  benefitName: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.text.primary
  },
  benefitPeriod: {
    fontSize: 12,
    color: tokens.colors.brand.primary,
    fontWeight: "600",
    marginTop: 2
  },
  benefitRule: {
    fontSize: 11,
    color: tokens.colors.text.secondary,
    marginTop: 4,
    lineHeight: 15
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle,
    alignItems: "flex-end"
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historyService: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.text.primary
  },
  historyMeta: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    marginTop: 2
  }
});

export {ScreenErrorBoundary as ErrorBoundary} from "../../components/ScreenErrorBoundary";
