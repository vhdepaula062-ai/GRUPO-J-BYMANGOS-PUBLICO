import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";

export default function BeneficiosScreen() {
  const [activeVoucher, setActiveVoucher] = useState<{
    code: string;
    secondsRemaining: number;
  } | null>(null);

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

  const generateVoucher = (_benefitName: string) => {
    setActiveVoucher({
      code: `GJ-${Math.floor(100000 + Math.random() * 900000)}`,
      secondsRemaining: 120
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Seus Benefícios Automotivos</Text>
          <Text style={styles.subtitle}>
            Serviços preventivos inclusos na sua assinatura ativa Grupo J.
          </Text>
        </View>

        {/* Modal / Card de Voucher Ativo */}
        {activeVoucher && (
          <View style={styles.voucherModal}>
            <View style={styles.voucherHeader}>
              <Text style={styles.voucherTitle}>Voucher Temporário de Check-in</Text>
              <MobileBadge
                label={`Expira em ${activeVoucher.secondsRemaining}s`}
                variant={activeVoucher.secondsRemaining < 30 ? "danger" : "warning"}
              />
            </View>

            <View style={styles.qrPlaceholder}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📱</Text>
              <Text style={styles.voucherToken}>{activeVoucher.code}</Text>
              <Text style={styles.qrSub}>Apresente este código ao atendente da oficina</Text>
            </View>
          </View>
        )}

        {/* Lista de Benefícios */}
        <View style={styles.list}>
          <MobileCard>
            <View style={styles.benefitRow}>
              <div>
                <Text style={styles.benefitName}>Alinhamento 3D e Balanceamento</Text>
                <Text style={styles.benefitPeriod}>Ciclo Semestral • 2 manutenções por ciclo</Text>
              </div>
              <MobileBadge label="Disponível (2/2)" variant="success" />
            </View>
            <View style={styles.cardFooter}>
              <MobileButton
                label="Gerar Voucher para Uso"
                variant="primary"
                size="sm"
                onPress={() => generateVoucher("Alinhamento 3D")}
              />
            </View>
          </MobileCard>

          <MobileCard>
            <View style={styles.benefitRow}>
              <div>
                <Text style={styles.benefitName}>Cristalização de Para-brisa</Text>
                <Text style={styles.benefitPeriod}>Ciclo Semestral • 2 aplicações por ciclo</Text>
              </div>
              <MobileBadge label="Disponível (2/2)" variant="success" />
            </View>
            <View style={styles.cardFooter}>
              <MobileButton
                label="Gerar Voucher para Uso"
                variant="primary"
                size="sm"
                onPress={() => generateVoucher("Cristalização")}
              />
            </View>
          </MobileCard>

          <MobileCard>
            <View style={styles.benefitRow}>
              <div>
                <Text style={styles.benefitName}>Check-up Preventivo 50 Itens</Text>
                <Text style={styles.benefitPeriod}>Ciclo Trimestral • 4 inspeções por ciclo</Text>
              </div>
              <MobileBadge label="Disponível (4/4)" variant="success" />
            </View>
            <View style={styles.cardFooter}>
              <MobileButton
                label="Gerar Voucher para Uso"
                variant="primary"
                size="sm"
                onPress={() => generateVoucher("Check-up 50 Itens")}
              />
            </View>
          </MobileCard>
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
  voucherModal: {
    backgroundColor: tokens.colors.brand.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  voucherTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  qrPlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  voucherToken: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
    color: tokens.colors.brand.primary
  },
  qrSub: {
    fontSize: 11,
    color: tokens.colors.text.secondary,
    marginTop: 6
  },
  list: {
    gap: 12
  },
  benefitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  benefitName: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.text.primary
  },
  benefitPeriod: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    marginTop: 2
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle,
    alignItems: "flex-end"
  }
});
