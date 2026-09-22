import {AccountTools} from "../../components/AccountTools";
import React, { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileCard, MobileBadge, MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../providers/AuthProvider";

type ProfileData = { profile: { full_name: string; email: string; cpf_masked: string | null; phone: string | null }; subscriptions: Array<{ id:string; current_period_end:string; cancel_at_period_end:boolean; status: string; plan: { name: string; price_cents: number } }> };

export default function PerfilScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const load = useCallback(() => api.getMe<ProfileData>(), []);
  const { data, loading, error, reload } = useApiResource(load);
  const loadPayments = useCallback(() => api.getPayments<Array<{ id: string; status: string; amount_cents: number; currency: string; created_at: string }>>(), []);
  const payments = useApiResource(loadPayments);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir Minha Conta",
      "Tem certeza que deseja solicitar a exclusão da sua conta e dados pessoais? A solicitação será analisada conforme a LGPD e as regras de retenção obrigatória.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Exclusão",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.deleteMyAccount<{ protocol: string; deadline_at: string }>();
              Alert.alert("Solicitação registrada", `Protocolo ${response.data.protocol}. O pedido será tratado até ${new Date(response.data.deadline_at).toLocaleDateString("pt-BR")}.`);
            } catch {
              Alert.alert("Não foi possível registrar", "Tente novamente quando estiver conectado.");
            }
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
        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={{ color: tokens.colors.status.danger }}>{error}</Text> : null}
        {data ? <>

        {/* Dados Pessoais com CPF Mascarado */}
        <MobileCard>
          <Text style={styles.cardSectionTitle}>Dados Pessoais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{data.profile.full_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-mail:</Text>
            <Text style={styles.infoValue}>{data.profile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF (LGPD):</Text>
            <Text style={styles.infoValue}>{data.profile.cpf_masked ?? "Não informado"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Celular:</Text>
            <Text style={styles.infoValue}>{data.profile.phone ?? "Não informado"}</Text>
          </View>
        </MobileCard>

        <AccountTools profile={data.profile} reload={reload}/>
        {/* Assinatura e Pagamento */}
        <MobileCard>
          <View style={styles.subHeader}>
            <Text style={styles.cardSectionTitle}>Assinatura Mensal</Text>
            <MobileBadge label={data.subscriptions?.[0]?.status === "active" && new Date(data.subscriptions[0].current_period_end).getTime()>Date.now() ? "Ativa" : "Pendente"} variant={data.subscriptions?.[0]?.status === "active" && new Date(data.subscriptions[0].current_period_end).getTime()>Date.now() ? "success" : "warning"} />
          </View>
          <Text style={styles.subDesc}>{data.subscriptions?.[0]?.plan?.name ?? "Nenhuma assinatura contratada"}</Text>
          {data.subscriptions?.[0]&&<><Text>Vigência até {new Date(data.subscriptions[0].current_period_end).toLocaleDateString("pt-BR")}</Text>{data.subscriptions[0].cancel_at_period_end?<Text>Renovação desativada.</Text>:<MobileButton label="Cancelar ao fim da vigência" variant="outline" onPress={()=>Alert.alert("Cancelar renovação","O acesso permanece até o fim do período atual.",[{text:"Voltar",style:"cancel"},{text:"Confirmar",onPress:async()=>{try{await api.post("/api/v1/subscriptions/cancel",{id:data.subscriptions[0]!.id});await reload();}catch(e){Alert.alert("Não foi possível cancelar",e instanceof Error?e.message:"Tente novamente.");}}}])}/>}</>}

        </MobileCard>
        </> : null}

        <MobileCard>
          <Text style={styles.cardSectionTitle}>Pagamentos registrados</Text>
          {payments.loading ? <ActivityIndicator /> : null}
          {payments.error ? <Text style={{ color: tokens.colors.status.danger }}>{payments.error}</Text> : null}
          {!payments.loading && !payments.error && payments.data?.length === 0 ? <Text>Nenhum pagamento registrado. Assinatura ativa não comprova pagamento.</Text> : null}
          {!payments.error ? payments.data?.map(payment => <View key={payment.id} style={styles.infoRow}>
            <Text>{new Date(payment.created_at).toLocaleDateString("pt-BR")}</Text>
            <Text>{(payment.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: payment.currency })} — {({ paid: "Pago", pending: "Pendente", authorized: "Autorizado", failed: "Falhou", refunded: "Estornado", charged_back: "Contestado" } as Record<string, string>)[payment.status] ?? payment.status}</Text>
          </View>) : null}
        </MobileCard>

        {/* Conformidade e Privacidade LGPD / App Store */}
        <MobileCard>
          <Text style={styles.cardSectionTitle}>Privacidade e Governança</Text>
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
          onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
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
