import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@grupo-j/design-tokens";

export default function NotificacoesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.subtitle}>Avisos sobre seu plano, benefícios e manutenções</Text>
        </View>

        <Text style={styles.notifDesc}>Nenhuma notificação registrada.</Text>
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
  notifDesc: { fontSize: 13, color: tokens.colors.text.secondary, marginTop: 4, lineHeight: 18 },
});
