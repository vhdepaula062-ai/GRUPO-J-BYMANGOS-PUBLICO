import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";

interface ServiceBenefit {
  id: string;
  total_quantity: number;
  available_quantity: number;
  benefit: { id: string; name: string; description: string; periodicity: string };
}
type Vehicle = { id: string };

export default function BeneficiosScreen() {
  const [activeVoucher, setActiveVoucher] = useState<{
    code: string;
    benefitName: string;
    secondsRemaining: number;
  } | null>(null);
  const load = useCallback(async () => {
    const [benefits, vehicles] = await Promise.all([api.getBenefits<ServiceBenefit[]>(), api.getVehicles<Vehicle[]>()]);
    return { data: { benefits: benefits.data, vehicles: vehicles.data } };
  }, []);
  const { data, loading, error } = useApiResource(load);

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

  const generateVoucher = async (benefit: ServiceBenefit) => {
    const vehicle = data?.vehicles[0];
    if (!vehicle) return Alert.alert("Veículo necessário", "Cadastre um veículo antes de gerar o voucher.");
    try {
      const response = await api.post<{ voucherCode: string; expiresAt: string }, { vehicleId: string; benefitDefinitionId: string }>("/api/v1/benefits", { vehicleId: vehicle.id, benefitDefinitionId: benefit.benefit.id });
      setActiveVoucher({ code: response.data.voucherCode, benefitName: benefit.benefit.name, secondsRemaining: Math.max(0, Math.floor((new Date(response.data.expiresAt).getTime() - Date.now()) / 1000)) });
    } catch (cause) { Alert.alert("Voucher não gerado", cause instanceof Error ? cause.message : "Tente novamente."); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Serviços Inclusos no Plano</Text>
          <Text style={styles.subtitle}>
            Assinatura R$ 50,00/mês • Cobertura preventiva garantida Grupo J
          </Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}

        {/* Modal / Card de Voucher Ativo */}
        {activeVoucher && (
          <View style={styles.voucherModal}>
            <View style={styles.voucherHeader}>
              <View>
                <Text style={styles.voucherTitle}>{activeVoucher.benefitName}</Text>
                <Text style={styles.voucherSubtitle}>Voucher Temporário com Assinatura Digital</Text>
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
                  label="⚡ Gerar Voucher de Atendimento"
                  variant="primary"
                  size="sm"
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
    padding: 20
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
