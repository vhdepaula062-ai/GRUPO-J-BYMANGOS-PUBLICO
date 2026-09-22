import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@grupo-j/design-tokens";
import { useAuth } from "../../providers/AuthProvider";

type TabIconName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(active: TabIconName, inactive: TabIconName) {
  return function TabBarIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} color={color} size={size} />;
  };
}

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
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
        },
        tabBarIconStyle: {
          marginTop: 1
        }
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Início",
          tabBarIcon: tabIcon("home", "home-outline")
        }}
      />
      <Tabs.Screen
        name="beneficios"
        options={{
          title: "Benefícios",
          tabBarIcon: tabIcon("gift", "gift-outline")
        }}
      />
      <Tabs.Screen
        name="oficinas"
        options={{
          title: "Oficinas",
          tabBarIcon: tabIcon("construct", "construct-outline")
        }}
      />
      <Tabs.Screen
        name="veiculos"
        options={{
          title: "Veículos",
          tabBarIcon: tabIcon("car-sport", "car-sport-outline")
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: tabIcon("person-circle", "person-circle-outline")
        }}
      />
      <Tabs.Screen name="atendimento" options={{href:null}}/>
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
