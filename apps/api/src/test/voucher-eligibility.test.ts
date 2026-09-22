import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
const state=vi.hoisted(()=>({rpc:vi.fn()}));
vi.mock("@/lib/auth",()=>({authenticateRequest:async()=>({user:{id:"user"},db:{rpc:state.rpc}}),isAuthFailure:()=>false,getCustomerId:vi.fn(),getAdminDatabase:vi.fn()}));
import {POST} from "../app/api/v1/benefits/route";
const vehicleId="00000000-0000-4000-8000-000000000001",benefitDefinitionId="00000000-0000-4000-8000-000000000002";
const request=(extra={})=>new NextRequest("http://localhost/api/v1/benefits",{method:"POST",body:JSON.stringify({vehicleId,benefitDefinitionId,...extra})});
describe("atomic voucher boundary",()=>{
 beforeEach(()=>state.rpc.mockReset());
 it.each(["SUBSCRIPTION_INACTIVE","BENEFIT_BALANCE_EXHAUSTED","WORKSHOP_NOT_ACTIVE","BENEFIT_GRACE_PERIOD","VEHICLE_NOT_FOUND"])("refuses %s",async message=>{state.rpc.mockResolvedValue({error:{message}});expect((await POST(request())).status).toBe(403);});
 it("fails closed on database errors without exposing internals",async()=>{state.rpc.mockResolvedValue({error:{message:"private internal data"}});const r=await POST(request());expect(r.status).toBe(503);expect(await r.text()).not.toContain("private internal data");});
 it("does not accept a caller supplied customer",async()=>{expect((await POST(request({customerId:vehicleId}))).status).toBe(422);expect(state.rpc).not.toHaveBeenCalled();});
 it("uses only the caller session for the database transaction",async()=>{const voucher={id:vehicleId,voucherCode:"TOKEN",expiresAt:"2099-01-01"};state.rpc.mockResolvedValue({data:voucher});const r=await POST(request());expect((await r.json()).data).toEqual(voucher);expect(state.rpc).toHaveBeenCalledWith("create_benefit_voucher",{p_vehicle_id:vehicleId,p_benefit_definition_id:benefitDefinitionId});});
});
