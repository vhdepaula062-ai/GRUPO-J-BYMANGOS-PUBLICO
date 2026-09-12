import React from "react";
import { Tabs } from "expo-router";
import { tokens } from "@grupo-j/design-tokens";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.brand.primary,
        tabBarInactiveTintColor: tokens.colors.text.muted,
        tabBarStyle: {
          backgroundColor: tokens.colors.surface.default,
          borderTopColor: tokens.colors.border.default,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Início"
        }}
      />
      <Tabs.Screen
        name="beneficios"
        options={{
          title: "Benefícios"
        }}
      />
      <Tabs.Screen
        name="oficinas"
        options={{
          title: "Oficinas"
        }}
      />
      <Tabs.Screen
        name="veiculos"
        options={{
          title: "Veículos"
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil"
        }}
      />
      {/* Rotas ocultas da barra de abas mas navegáveis */}
      <Tabs.Screen
        name="historico"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="promocoes"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
