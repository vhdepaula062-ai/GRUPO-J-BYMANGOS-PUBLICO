import React from "react";
import {act,create,ReactTestRenderer,ReactTestRendererJSON} from "react-test-renderer";
import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
const state=vi.hoisted(()=>({main:{data:null,loading:false,error:null,reload:vi.fn()} as any,privacy:{data:[],loading:false,error:null,reload:vi.fn()} as any,push:vi.fn(),back:vi.fn()}));
vi.mock("react-native",()=>({Text:"Text",View:"View",ScrollView:"ScrollView",ActivityIndicator:"ActivityIndicator",TouchableOpacity:"TouchableOpacity",TextInput:"TextInput",KeyboardAvoidingView:"KeyboardAvoidingView",RefreshControl:"RefreshControl",StyleSheet:{create:(v:any)=>v},Platform:{OS:"android"},Alert:{alert:vi.fn()}}));
vi.mock("react-native-safe-area-context",()=>({SafeAreaView:"SafeAreaView"}));
vi.mock("expo-status-bar",()=>({StatusBar:()=>null}));
vi.mock("expo-router",()=>({useRouter:()=>({push:state.push,back:state.back,replace:state.push,canGoBack:()=>true})}));
vi.mock("../src/hooks/useApiResource",()=>({useApiResource:(loader:()=>unknown)=>loader.toString().includes('/api/v1/me/privacy')?state.privacy:state.main}));
vi.mock("../src/lib/api",()=>({api:{get:vi.fn(),getBenefits:vi.fn(),getVehicles:vi.fn(),post:vi.fn(),patch:vi.fn()}}));
import Requests from "../src/app/(app)/atendimento";
import Legal from "../src/app/legal";
import Benefits from "../src/app/(app)/beneficios";
let renderer:ReactTestRenderer;
function render(element:React.ReactElement){act(()=>{renderer=create(element);});return renderer;}
function nativeTextContract(node:ReactTestRendererJSON|ReactTestRendererJSON[]|null){if(!node)return;if(Array.isArray(node)){node.forEach(nativeTextContract);return;}for(const child of node.children??[]){if(typeof child==='string'){expect(node.type,`Raw text ${JSON.stringify(child)} outside native Text`).toBe('Text');}else nativeTextContract(child);}}
const output=()=>renderer.root.findAllByType("Text").map(n=>n.children.filter(c=>typeof c==="string").join("")).join("\n");
beforeEach(()=>{state.main={data:null,loading:false,error:null,reload:vi.fn()};state.privacy={data:[],loading:false,error:null,reload:vi.fn()};state.push.mockReset();});
afterEach(()=>{if(renderer)act(()=>renderer.unmount());});
describe("reported mobile screen regressions",()=>{
 it("opens Atendimento with no records without raw text under native views",()=>{state.main.data=[];render(<Requests/>);nativeTextContract(renderer.toJSON());});
 it("keeps privacy readable on an explicitly light background",()=>{state.main.data={settings:{legalPublished:false}};render(<Legal/>);const safe=renderer.root.findByType('SafeAreaView');const style=Object.assign({},...([safe.props.style].flat()));expect(style.backgroundColor).toBeTruthy();});
 it("explains missing vehicles and benefits instead of leaving the page empty",()=>{state.main.data={benefits:[],vehicles:[]};render(<Benefits/>);expect(output()).toContain('Nenhum veículo cadastrado');expect(output()).toContain('Nenhum benefício disponível');});
});

const button=(label:string)=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.findAllByType('Text').some(t=>t.children.join('')===label));
describe('empty, error and populated states',()=>{
 it('shows empty request history without hiding the form',()=>{state.main.data=[];render(<Requests/>);expect(output()).toContain('Nenhum protocolo registrado');expect(button('Abrir protocolo')?.props.disabled).toBe(true);});
 it('renders older tickets with absent messages safely',()=>{state.main.data=[{id:'ticket',protocol:'GJ-TEST',subject:'Solicitação',status:'open',created_at:'2026-09-19',messages:null}];render(<Requests/>);nativeTextContract(renderer.toJSON());expect(output()).toContain('GJ-TEST');expect(button('Responder')).toBeDefined();});
 it('keeps a closed ticket readable without a reply form',()=>{state.main.data=[{id:'ticket',protocol:'GJ-TEST',subject:'Solicitação',status:'closed',created_at:'2026-09-19',messages:[{id:'m',from_admin:true,body:'Resposta registrada',created_at:'2026-09-19'}]}];render(<Requests/>);nativeTextContract(renderer.toJSON());expect(output()).toContain('Resposta registrada');expect(button('Responder')).toBeUndefined();});
 it('reports privacy loading failures without claiming no requests exist',()=>{state.main.data=[];state.privacy={...state.privacy,data:null,error:'Conexão indisponível'};render(<Requests/>);expect(output()).toContain('Conexão indisponível');expect(output()).not.toContain('Nenhum pedido de exclusão registrado');act(()=>button('Tentar carregar pedidos novamente')?.props.onPress());expect(state.privacy.reload).toHaveBeenCalledOnce();});
 it('keeps loading distinct from an empty benefit list',()=>{state.main.loading=true;render(<Benefits/>);expect(output()).not.toContain('Nenhum benefício disponível');expect(renderer.root.findAllByType('ActivityIndicator').length).toBeGreaterThan(0);});
 it('offers retry for benefit connection failure, not false empty balances',()=>{state.main.error='Conexão indisponível';render(<Benefits/>);expect(output()).not.toContain('Nenhum benefício disponível');act(()=>button('Tentar novamente')?.props.onPress());expect(state.main.reload).toHaveBeenCalledOnce();});
 it('takes a new customer to vehicle registration and profile',()=>{state.main.data={benefits:[],vehicles:[]};render(<Benefits/>);act(()=>button('Cadastrar veículo')?.props.onPress());expect(state.push).toHaveBeenCalledWith('/(app)/veiculos');act(()=>button('Consultar meu perfil')?.props.onPress());expect(state.push).toHaveBeenCalledWith('/(app)/perfil');});
 it.each([0,1])('prevents vouchers without a vehicle and respects balance %s',(balance)=>{state.main.data={benefits:[{id:'b',total_quantity:1,available_quantity:balance,benefit:{id:'def',name:'Alinhamento',description:'Preventivo',periodicity:'monthly'}}],vehicles:[]};render(<Benefits/>);const label=balance?'Gerar voucher de atendimento':'Saldo esgotado neste período';expect(button(label)?.props.disabled).toBe(true);nativeTextContract(renderer.toJSON());});
 it('renders an eligible vehicle and enables a funded benefit',()=>{state.main.data={benefits:[{id:'b',total_quantity:1,available_quantity:1,benefit:{id:'def',name:'Alinhamento',description:'Preventivo',periodicity:'monthly'}}],vehicles:[{id:'v',plate:'TST0J18',model:'Teste'}]};render(<Benefits/>);expect(output()).toContain('TST0J18');expect(button('Gerar voucher de atendimento')?.props.disabled).toBe(false);});
 it('renders published legal text and an accessible back action',()=>{state.main.data={settings:{legalPublished:true,controllerName:'Empresa de teste',controllerDocument:'Documento de teste',privacyEmail:'privacidade@example.test',privacyText:'Política de teste',termsText:'Termos de teste'}};render(<Legal/>);nativeTextContract(renderer.toJSON());expect(output()).toContain('Política de teste');expect(output()).toContain('Termos de teste');act(()=>button('Voltar')?.props.onPress());expect(state.back).toHaveBeenCalled();});
});
