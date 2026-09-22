import React,{useEffect} from "react";
import {act,create,ReactTestRenderer} from "react-test-renderer";
import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
const app=vi.hoisted(()=>({currentState:null as string|null,listener:null as null|((s:string)=>void),remove:vi.fn()}));
vi.mock('react-native',()=>({AppState:{get currentState(){return app.currentState;},addEventListener:(_event:string,listener:(s:string)=>void)=>{app.listener=listener;return{remove:app.remove};}}}));
vi.mock('expo-router',()=>({useFocusEffect:(callback:()=>void)=>useEffect(callback,[callback])}));
import {useApiResource} from '../src/hooks/useApiResource';
let renderer:ReactTestRenderer;let latest:any;
function Probe({load}:{load:()=>Promise<{data:string[]}>}){latest=useApiResource(load);return null;}
beforeEach(()=>{app.currentState=null;app.listener=null;app.remove.mockReset();});
afterEach(()=>{if(renderer)act(()=>renderer.unmount());});
describe('initial resource loading',()=>{
 it('loads on first focus even before Android reports its app state',async()=>{const load=vi.fn().mockResolvedValue({data:['ready']});await act(async()=>{renderer=create(<Probe load={load}/>);});expect(load).toHaveBeenCalledOnce();expect(latest.data).toEqual(['ready']);expect(latest.loading).toBe(false);});
 it('waits while backgrounded and resumes when active',async()=>{app.currentState='background';const load=vi.fn().mockResolvedValue({data:[]});await act(async()=>{renderer=create(<Probe load={load}/>);});expect(load).not.toHaveBeenCalled();await act(async()=>{app.currentState='active';app.listener?.('active');});expect(load).toHaveBeenCalledOnce();expect(latest.data).toEqual([]);});
});
