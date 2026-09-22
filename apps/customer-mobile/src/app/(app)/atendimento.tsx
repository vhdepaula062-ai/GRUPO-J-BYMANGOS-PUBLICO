import React, {useCallback,useState} from "react";
import {Text,ScrollView,ActivityIndicator,Alert,View,StyleSheet,KeyboardAvoidingView,Platform,RefreshControl} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {useRouter} from "expo-router";
import {MobileCard,MobileInput,MobileButton,MobileEmptyState} from "@grupo-j/ui-mobile";
import {tokens} from "@grupo-j/design-tokens";
import {api} from "../../lib/api";
import {useApiResource} from "../../hooks/useApiResource";
type Ticket={id:string;protocol:string;subject:string;status:string;kind:string;created_at:string;messages?:Array<{id:string;body:string;from_admin:boolean;created_at:string}>|null};
const labels:Record<string,string>={open:"Aberto",in_progress:"Em análise",answered:"Respondido",closed:"Encerrado",requested:"Solicitado",identity_check:"Conferência de identidade",approved:"Aprovado",processing:"Em tratamento",completed:"Concluído",rejected:"Indeferido"};
function Reply({id,reload}:{id:string;reload:()=>Promise<void>}){
 const [body,setBody]=useState("");const [busy,setBusy]=useState(false);
 async function send(){
  if(busy||body.trim().length<5)return;
  setBusy(true);
  try{await api.patch("/api/v1/requests",{id,body:body.trim()});setBody("");await reload();}
  catch(e){Alert.alert("Resposta não enviada",e instanceof Error?e.message:"Tente novamente.");}
  finally{setBusy(false);}
 }
 return <View style={styles.reply}>
  <MobileInput label="Sua resposta" value={body} onChangeText={setBody} multiline maxLength={4000} style={styles.messageInput} editable={!busy}/>
  <MobileButton label="Responder" isLoading={busy} disabled={body.trim().length<5} onPress={send}/>
 </View>;
}
export default function Requests(){
 const router=useRouter();
 const [before,setBefore]=useState("");const [kind,setKind]=useState<"support"|"privacy">("support");
 const [subject,setSubject]=useState("");const [body,setBody]=useState("");const [busy,setBusy]=useState(false);
 const load=useCallback(()=>api.get<Ticket[]>("/api/v1/requests"+(before?"?before="+encodeURIComponent(before):"")),[before]);
 const {data,loading,error,reload}=useApiResource(load);
 const privacyLoad=useCallback(()=>api.get<Array<{protocol:string;status:string;deadline_at:string}>>("/api/v1/me/privacy"),[]);
 const privacy=useApiResource(privacyLoad);
 const tickets=Array.isArray(data)?data:[];
 const erasures=Array.isArray(privacy.data)?privacy.data:[];
 async function create(){
  if(busy||subject.trim().length<5||body.trim().length<5)return;
  setBusy(true);
  try{
   await api.post("/api/v1/requests",{kind,subject:subject.trim(),body:body.trim()});setSubject("");setBody("");
   if(before)setBefore("");else await reload();
   Alert.alert("Protocolo registrado","Acompanhe a resposta nesta tela.");
  }catch(e){Alert.alert("Não foi possível registrar",e instanceof Error?e.message:"Tente novamente.");}
  finally{setBusy(false);}
 }
 return <SafeAreaView style={styles.container}>
  <StatusBar style="dark" backgroundColor={tokens.colors.surface.subtle}/>
  <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS==="ios"?"padding":undefined}>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={loading||privacy.loading} onRefresh={()=>{void reload();void privacy.reload();}}/>}>
    <MobileButton label="Voltar" variant="outline" onPress={()=>router.canGoBack()?router.back():router.replace("/(app)/perfil")}/>
    <Text accessibilityRole="header" style={styles.title}>Atendimento e privacidade</Text>
    <Text style={styles.body}>Abra um protocolo e acompanhe suas respostas. O atendimento está disponível mesmo sem uma assinatura.</Text>
    <MobileCard>
     <Text style={styles.section}>Nova solicitação</Text>
     <Text style={styles.body}>Selecione o assunto. Evite incluir senhas ou dados de outras pessoas.</Text>
     <View style={styles.choice}>
      <MobileButton label="Suporte" variant={kind==="support"?"primary":"outline"} accessibilityState={{selected:kind==="support"}} onPress={()=>setKind("support")} style={styles.choiceButton}/>
      <MobileButton label="Privacidade" variant={kind==="privacy"?"primary":"outline"} accessibilityState={{selected:kind==="privacy"}} onPress={()=>setKind("privacy")} style={styles.choiceButton}/>
     </View>
     <MobileInput label="Assunto" value={subject} onChangeText={setSubject} maxLength={160} editable={!busy}/>
     <MobileInput label="Mensagem" value={body} onChangeText={setBody} multiline maxLength={4000} style={styles.messageInput} editable={!busy}/>
     <MobileButton label="Abrir protocolo" onPress={create} isLoading={busy} disabled={subject.trim().length<5||body.trim().length<5}/>
    </MobileCard>
    <Text accessibilityRole="header" style={styles.section}>Seus protocolos</Text>
    {loading ? <ActivityIndicator color={tokens.colors.brand.primary} accessibilityLabel="Carregando protocolos"/> : null}
    {error ? <View><Text accessibilityRole="alert" style={styles.error}>{error}</Text><MobileButton label="Tentar carregar protocolos novamente" variant="outline" onPress={()=>void reload()}/></View> : null}
    {!loading&&!error&&tickets.length===0 ? <MobileEmptyState title="Nenhum protocolo registrado" description="Use o formulário acima para falar com o atendimento ou enviar um pedido de privacidade."/> : null}
    {tickets.map(t=><MobileCard key={t.id}>
     <Text selectable style={styles.protocol}>{t.protocol}</Text>
     <Text style={styles.section}>{t.subject}</Text>
     <Text style={styles.body}>{labels[t.status]??t.status}</Text>
     {(Array.isArray(t.messages)?t.messages:[]).map(m=><View key={m.id} style={styles.message}>
      <Text style={styles.messageAuthor}>{m.from_admin?"Atendimento":"Você"} · {new Date(m.created_at).toLocaleString("pt-BR")}</Text>
      <Text selectable style={styles.body}>{m.body}</Text>
     </View>)}
     {t.status!=="closed" ? <Reply id={t.id} reload={reload}/> : <Text style={styles.body}>Este protocolo foi encerrado. Para outro assunto, abra uma nova solicitação.</Text>}
    </MobileCard>)}
    {tickets.length===50 ? <MobileButton label="Protocolos anteriores" onPress={()=>setBefore(tickets[49]!.created_at)}/> : null}
    {before ? <MobileButton label="Mais recentes" onPress={()=>setBefore("")}/> : null}
    <Text accessibilityRole="header" style={styles.section}>Pedidos de exclusão</Text>
    {privacy.loading ? <ActivityIndicator color={tokens.colors.brand.primary} accessibilityLabel="Carregando pedidos de exclusão"/> : null}
    {privacy.error ? <View><Text accessibilityRole="alert" style={styles.error}>{privacy.error}</Text><MobileButton label="Tentar carregar pedidos novamente" variant="outline" onPress={()=>void privacy.reload()}/></View> : null}
    {!privacy.loading&&!privacy.error&&erasures.length===0 ? <Text style={styles.body}>Nenhum pedido de exclusão registrado.</Text> : null}
    {erasures.map(p=><MobileCard key={p.protocol}>
     <Text selectable style={styles.protocol}>{p.protocol}</Text>
     <Text style={styles.body}>{labels[p.status]??p.status}</Text>
     <Text style={styles.body}>Prazo de tratamento: {new Date(p.deadline_at).toLocaleDateString("pt-BR")}</Text>
    </MobileCard>)}
   </ScrollView>
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 container:{flex:1,backgroundColor:tokens.colors.surface.subtle},fill:{flex:1},scroll:{padding:20,gap:16,width:"100%",maxWidth:680,alignSelf:"center",paddingBottom:32},
 title:{fontSize:24,fontWeight:"800",color:tokens.colors.text.primary},section:{fontSize:17,fontWeight:"700",color:tokens.colors.text.primary,marginBottom:8},body:{fontSize:14,lineHeight:22,color:tokens.colors.text.secondary},error:{color:tokens.colors.status.danger,fontSize:14,lineHeight:22,marginBottom:12},protocol:{fontSize:13,fontWeight:"700",color:tokens.colors.brand.primary,marginBottom:8},choice:{flexDirection:"row",flexWrap:"wrap",gap:10,marginVertical:16},choiceButton:{flexGrow:1,minWidth:110},messageInput:{height:120,textAlignVertical:"top",paddingTop:12,paddingBottom:12},message:{paddingVertical:12,borderTopWidth:1,borderTopColor:tokens.colors.border.subtle,marginTop:8},messageAuthor:{fontSize:13,fontWeight:"600",color:tokens.colors.text.primary,marginBottom:6},reply:{marginTop:14}
});

export {ScreenErrorBoundary as ErrorBoundary} from "../../components/ScreenErrorBoundary";
