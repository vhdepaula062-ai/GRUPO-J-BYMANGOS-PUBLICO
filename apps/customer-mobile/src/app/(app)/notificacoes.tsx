import React,{useCallback,useState} from "react";
import {Text,ScrollView,ActivityIndicator,Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {MobileCard,MobileButton} from "@grupo-j/ui-mobile";
import {useRouter} from "expo-router";
import {api} from "../../lib/api";
import {useApiResource} from "../../hooks/useApiResource";
type Item={id:string;title:string;message:string;entity_type:string;created_at:string;read_at:string|null};
export default function Notifications(){
 const router=useRouter();const [cursor,setCursor]=useState<string|null>(null);
 const load=useCallback(()=>api.get<{items:Item[];next:string|null}>("/api/v1/notifications"+(cursor?`?before=${encodeURIComponent(cursor)}`:"")),[cursor]);
 const {data,loading,error,reload}=useApiResource(load);
 async function open(n:Item){try{await api.patch("/api/v1/notifications",{id:n.id});await reload();const target=n.entity_type==="portal_requests"?"/(app)/atendimento":n.entity_type==="service_orders"?"/(app)/historico":n.entity_type==="benefit_redemptions"?"/(app)/beneficios":"/(app)/perfil";router.push(target);}catch{Alert.alert("Não foi possível abrir","Tente novamente.");}}
 return <SafeAreaView style={{flex:1,backgroundColor:"#f8fafc"}}><ScrollView contentContainerStyle={{padding:20,gap:14}}><Text style={{fontSize:24,fontWeight:"700"}}>Notificações</Text><Text>Atualização automática enquanto esta tela estiver aberta.</Text>{loading&&<ActivityIndicator/>}{error&&<Text accessibilityRole="alert">{error}</Text>}{data?.items.length===0&&!error&&<Text>Nenhuma notificação registrada.</Text>}{data?.items.map(n=><MobileCard key={n.id}><Text style={{fontWeight:"700"}}>{!n.read_at?"● ":""}{n.title}</Text><Text>{n.message}</Text><Text>{new Date(n.created_at).toLocaleString("pt-BR")}</Text><MobileButton label="Ver detalhes" variant="outline" onPress={()=>open(n)}/></MobileCard>)}{data?.next&&<MobileButton label="Avisos anteriores" onPress={()=>setCursor(data.next)}/>}<MobileButton label="Mais recentes" variant="outline" onPress={()=>{setCursor(null);void reload();}}/></ScrollView></SafeAreaView>;
}
