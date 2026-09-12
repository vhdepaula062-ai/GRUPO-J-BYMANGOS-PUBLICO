import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { mockCustomer } from "@grupo-j/test-utils";
import { tokens } from "@grupo-j/design-tokens";

export default function PerfilScreen() {
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir Minha Conta",
      "Tem certeza que deseja solicitar a exclusão da sua conta e dados pessoais? Esta ação cancelará sua assinatura ativa imediatamente de acordo com a LGPD e as diretrizes das lojas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Exclusão",
          style: "destructive",
          onPress: () => {
            Alert.alert("Solicitação Registrada", "Sua conta foi programada para exclusão e sua assinatura cancelada.");
            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
          <Text style={styles.subtitle}>Dados cadastrais, assinatura e privacidade LGPD</Text>
        </View>

        {/* Dados Pessoais com CPF Mascarado */}
        <MobileCard>
          <Text style={styles.cardSectionTitle}>Dados Pessoais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{mockCustomer.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-mail:</Text>
            <Text style={styles.infoValue}>{mockCustomer.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF (LGPD):</Text>
            <Text style={styles.infoValue}>{mockCustomer.cpfMasked}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Celular:</Text>
            <Text style={styles.infoValue}>{mockCustomer.phone}</Text>
          </View>
        </MobileCard>

        {/* Assinatura e Pagamento */}
        <MobileCard>
          <View style={styles.subHeader}>
            <Text style={styles.cardSectionTitle}>Assinatura Mensal</Text>
            <MobileBadge label="R$ 50/mês" variant="success" />
          </View>
          <Text style={styles.subDesc}>Plano Motorista Grupo J • Renovação recorrente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Forma de Pagamento:</Text>
            <Text style={styles.infoValue}>Cartão de Crédito (final 1234)</Text>
          </View>
        </MobileCard>

        {/* Conformidade e Privacidade LGPD / App Store */}
        <MobileCard>
          <Text style={styles.cardSectionTitle}>Privacidade e Governança</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Exportação de Dados", "Um arquivo JSON com seus dados cadastrais foi enviado para seu e-mail.")}>
            <Text style={styles.menuItemText}>📄 Exportar meus dados cadastrais (LGPD Art. 18)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(app)/historico")}>
            <Text style={styles.menuItemText}>🔧 Histórico completo de manutenções</Text>
          </TouchableOpacity>

          <View style={styles.deleteSection}>
            <MobileButton
              label="Excluir Minha Conta (LGPD / App Store)"
              variant="danger"
              size="sm"
              onPress={handleDeleteAccount}
            />
          </View>
        </MobileCard>

        <View style={{ height: 16 }} />
        <MobileButton
          label="Sair da Conta"
          variant="outline"
          onPress={() => router.replace("/(auth)/login")}
        />
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
    marginTop: 2
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle
  },
  infoLabel: {
    fontSize: 13,
    color: tokens.colors.text.secondary
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.text.primary
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  subDesc: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginBottom: 8
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle
  },
  menuItemText: {
    fontSize: 13,
    color: tokens.colors.brand.primary,
    fontWeight: "600"
  },
  deleteSection: {
    marginTop: 16
  }
});
