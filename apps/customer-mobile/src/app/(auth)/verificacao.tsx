import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MobileButton } from "@grupo-j/ui-mobile";
import { tokens } from "@grupo-j/design-tokens";
import { api } from "../../lib/api";
import { BrandLogo } from "../../components/BrandLogo";

export default function VerificacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; delivery?: string }>();
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(params.delivery === "pending" ? "Sua conta foi criada, mas o envio do e-mail está indisponível. Aguarde e solicite um novo link abaixo." : "");
  const [message, setMessage] = useState("");
  const [retryAt, setRetryAt] = useState(() => Date.now() + 60000);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  const resend = async () => {
    if (!email || isLoading || seconds) return;
    setError(""); setMessage(""); setIsLoading(true);
    try {
      await api.post("/api/v1/auth/resend-confirmation", { email });
      setMessage("Se o cadastro estiver aguardando confirmação, um novo link será enviado. Use o e-mail mais recente e confira também o spam.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível reenviar. Tente novamente mais tarde."); }
    finally { setRetryAt(Date.now() + 60000); setNow(Date.now()); setIsLoading(false); }
  };
  return <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        <BrandLogo />
        <Text accessibilityRole="header" style={styles.title}>Confirme seu e-mail</Text>
        <Text style={styles.subtitle}>A confirmação é feita pelo link enviado ao seu e-mail. Você não precisa digitar um código numérico.</Text>
        {email ? <Text selectable style={styles.email}>{email}</Text> : <Text style={styles.error}>Volte ao login e informe o e-mail do cadastro para solicitar um novo link.</Text>}
        <View style={styles.card}>
          <Text style={styles.step}>1. Abra o e-mail de confirmação do Grupo J enviado pelo Supabase.</Text>
          <Text style={styles.step}>2. Toque no link de confirmação. Você pode abri-lo no celular ou no computador.</Text>
          <Text style={styles.step}>3. Volte ao aplicativo e entre com seu e-mail e senha.</Text>
        </View>
        <Text style={styles.subtitle}>Se o link vencer ou já tiver sido usado, tente entrar. Se o e-mail ainda não estiver confirmado, solicite outro link abaixo.</Text>
        {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <MobileButton label="Já confirmei — entrar" onPress={() => router.replace({ pathname: "/(auth)/login", params: { email } })}/>
        <View style={styles.gap}/>
        <MobileButton label={seconds ? `Reenviar link em ${seconds}s` : "Reenviar link de confirmação"} variant="outline" onPress={resend} disabled={!email || seconds > 0 || isLoading} isLoading={isLoading}/>
        <View style={styles.gap}/>
        <MobileButton label="Voltar ao login" variant="outline" onPress={() => router.replace("/(auth)/login")}/>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
 container:{flex:1,backgroundColor:tokens.colors.surface.default},scroll:{flexGrow:1,padding:24,justifyContent:"center"},content:{width:"100%",maxWidth:520,alignSelf:"center"},brand:{color:tokens.colors.brand.primary,fontWeight:"800",marginBottom:20},title:{fontSize:26,fontWeight:"800",color:tokens.colors.text.primary},subtitle:{fontSize:15,lineHeight:23,color:tokens.colors.text.secondary,marginVertical:12},email:{fontSize:16,fontWeight:"700",color:tokens.colors.text.primary,marginBottom:12},card:{padding:18,borderRadius:16,backgroundColor:tokens.colors.brand.surfaceSubtle,gap:14,marginVertical:12},step:{fontSize:15,lineHeight:23,color:tokens.colors.text.primary},error:{color:tokens.colors.status.danger,lineHeight:22,marginVertical:12},message:{color:tokens.colors.text.primary,lineHeight:22,marginVertical:12},gap:{height:14}
});
