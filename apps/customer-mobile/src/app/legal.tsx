import React,{useCallback} from "react";
import {ScrollView,Text,ActivityIndicator,StyleSheet,View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {useRouter} from "expo-router";
import {MobileButton,MobileCard} from "@grupo-j/ui-mobile";
import {tokens} from "@grupo-j/design-tokens";
import {api} from "../lib/api";
import {useApiResource} from "../hooks/useApiResource";
export default function Legal(){
 const router=useRouter();
 const load=useCallback(()=>api.get<{settings:{legalPublished:boolean;controllerName:string;controllerDocument:string;privacyEmail:string;privacyText:string;termsText:string}}>("/api/v1/remote-config"),[]);
 const {data,loading,error,reload}=useApiResource(load);const settings=data?.settings;
 return <SafeAreaView style={styles.container}>
  <StatusBar style="dark" backgroundColor={tokens.colors.surface.subtle}/>
  <ScrollView contentContainerStyle={styles.scroll}>
   <MobileButton label="Voltar" variant="outline" onPress={()=>router.canGoBack()?router.back():router.replace("/(auth)/login")}/>
   <Text accessibilityRole="header" style={styles.title}>Privacidade e termos</Text>
   {loading ? <ActivityIndicator color={tokens.colors.brand.primary} accessibilityLabel="Carregando documentos"/> : null}
   {error ? <View><Text accessibilityRole="alert" style={styles.error}>{error}</Text><MobileButton label="Tentar novamente" variant="outline" onPress={()=>void reload()}/></View> : null}
   {settings ? (settings.legalPublished ? <>
    <MobileCard><Text style={styles.heading}>{settings.controllerName}</Text><Text style={styles.body}>{settings.controllerDocument}</Text><Text selectable style={styles.body}>{settings.privacyEmail}</Text></MobileCard>
    <MobileCard><Text accessibilityRole="header" style={styles.heading}>Privacidade</Text><Text selectable style={styles.body}>{settings.privacyText}</Text></MobileCard>
    <MobileCard><Text accessibilityRole="header" style={styles.heading}>Termos de uso</Text><Text selectable style={styles.body}>{settings.termsText}</Text></MobileCard>
   </> : <MobileCard><Text style={styles.heading}>Documentos em preparação</Text><Text style={styles.body}>A identificação oficial da empresa e os documentos ainda aguardam publicação.</Text><Text style={styles.body}>Se você já possui uma conta, acesse Perfil → Atendimento e pedidos de privacidade para falar com a equipe e acompanhar seus protocolos.</Text></MobileCard>) : null}
  </ScrollView>
 </SafeAreaView>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:tokens.colors.surface.subtle},scroll:{padding:20,paddingBottom:32,gap:16,width:"100%",maxWidth:680,alignSelf:"center"},title:{fontSize:24,fontWeight:"800",color:tokens.colors.text.primary},heading:{fontSize:17,fontWeight:"700",color:tokens.colors.text.primary,marginBottom:12},body:{fontSize:15,lineHeight:24,color:tokens.colors.text.secondary,marginBottom:12},error:{fontSize:14,lineHeight:22,color:tokens.colors.status.danger,marginBottom:12}});

export {ScreenErrorBoundary as ErrorBoundary} from "../components/ScreenErrorBoundary";
