import {beforeEach,describe,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({authorize:vi.fn(),rpc:vi.fn(),from:vi.fn(),insert:vi.fn(),org:null as null|{id:string}}));
vi.mock("@/lib/supabase/authorized",()=>({createAuthorizedAdminClient:mocks.authorize}));
vi.mock("@/lib/supabase/server",()=>({createServerSupabaseClient:async()=>({rpc:mocks.rpc})}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
import {decommissionWorkshopAction} from "../app/(dashboard)/oficinas/actions";
import {createNetworkPromotion} from "../app/(dashboard)/promocoes/actions";
beforeEach(()=>{
 vi.clearAllMocks();mocks.org=null;mocks.authorize.mockResolvedValue({from:mocks.from});mocks.rpc.mockResolvedValue({error:null});
 mocks.from.mockImplementation((table:string)=>{
  const q:any={};for(const method of ["select","ilike","eq","limit"])q[method]=()=>q;
  q.maybeSingle=async()=>({data:mocks.org,error:null});q.insert=(value:any)=>{mocks.insert(table,value);return q;};q.single=async()=>({data:{id:"promotion"},error:null});return q;
 });
});
describe("remediation server actions",()=>{
 it("uses one authenticated database transaction for workshop decommissioning",async()=>{
  expect((await decommissionWorkshopAction({workshopId:"source",fallbackWorkshopId:"destination"})).success).toBe(true);
  expect(mocks.rpc).toHaveBeenCalledWith("decommission_workshop",{p_org:"source",p_fallback:"destination"});expect(mocks.from).not.toHaveBeenCalled();
 });
 it("does not claim success when transfer fails",async()=>{
  mocks.rpc.mockResolvedValue({error:{message:"private internal SQL"}});
  const r=await decommissionWorkshopAction({workshopId:"source"});expect(r.success).toBe(false);expect(r.message).not.toContain("private internal SQL");
 });
 it("checks authorization before transfer",async()=>{
  mocks.authorize.mockRejectedValue(new Error("Unauthorized"));await expect(decommissionWorkshopAction({workshopId:"source"})).rejects.toThrow();expect(mocks.rpc).not.toHaveBeenCalled();
 });
 it("never manufactures a company or document when the network is unconfigured",async()=>{
  const r=await createNetworkPromotion({title:"Campanha",description:"Descrição de teste"});expect(r.success).toBe(false);expect(r.error).toContain("Cadastre e aprove");expect(mocks.insert).not.toHaveBeenCalled();
 });
 it("publishes against an existing organization without computing a default document hash",async()=>{
  mocks.org={id:"existing-org"};const r=await createNetworkPromotion({title:"Campanha",description:"Descrição de teste"});expect(r.success).toBe(true);expect(mocks.insert).toHaveBeenCalledTimes(1);expect(mocks.insert).toHaveBeenCalledWith("promotions",expect.objectContaining({workshop_id:"existing-org"}));
 });
});
