import React from "react";
import {Text,View,StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {useRouter,type ErrorBoundaryProps} from "expo-router";
import {MobileButton} from "@grupo-j/ui-mobile";
import {tokens} from "@grupo-j/design-tokens";
export function ScreenErrorBoundary({retry}:ErrorBoundaryProps){
 const router=useRouter();
 return <SafeAreaView style={styles.container}>
  <StatusBar style="dark" backgroundColor={tokens.colors.surface.subtle}/>
  <View style={styles.content}>
   <Text accessibilityRole="header" style={styles.title}>Não foi possível exibir esta tela</Text>
   <Text style={styles.body}>Tente abrir novamente. Você também pode voltar e continuar usando o aplicativo.</Text>
   <MobileButton label="Tentar novamente" onPress={()=>void retry()}/>
   <MobileButton label="Voltar" variant="outline" onPress={()=>router.canGoBack()?router.back():router.replace("/")}/>
  </View>
 </SafeAreaView>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:tokens.colors.surface.subtle,justifyContent:"center"},content:{padding:24,gap:16,maxWidth:600,width:"100%",alignSelf:"center"},title:{fontSize:22,fontWeight:"700",color:tokens.colors.text.primary},body:{fontSize:15,lineHeight:23,color:tokens.colors.text.secondary}});
