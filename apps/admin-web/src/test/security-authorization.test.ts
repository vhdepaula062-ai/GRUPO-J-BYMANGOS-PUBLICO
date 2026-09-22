import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(()=>({admin:vi.fn(),role:vi.fn(),aal:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminServerClient:mocks.admin}));
vi.mock("@/lib/supabase/server",()=>({checkIsAdmin:mocks.role,createServerSupabaseClient:async()=>({auth:{mfa:{getAuthenticatorAssuranceLevel:mocks.aal}}}),assertRecentAuthentication:async()=>({success:true})}));
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { moderateWorkshopAction } from "../app/(dashboard)/oficinas/actions";
import { toggleBenefitStatus } from "../app/(dashboard)/beneficios/actions";
import { rejectErasureRequestAction } from "../app/(dashboard)/privacidade/actions";
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
beforeEach(()=>{vi.clearAllMocks();mocks.role.mockResolvedValue(false);});
describe("Administrative privilege boundary",()=>{
  it("rejects a caller with no administrative role before acquiring service credentials",async()=>{
    await expect(createAuthorizedAdminClient()).rejects.toThrow("não autorizado");
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("rejects moderation by a non-administrator",async()=>{
    await expect(moderateWorkshopAction("fixture","active")).rejects.toThrow("não autorizado");
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("rejects benefit changes by a non-administrator",async()=>{
    await expect(toggleBenefitStatus("fixture",true)).rejects.toThrow("não autorizado");
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("rejects privacy request rejection by a non-administrator",async()=>{
    await expect(rejectErasureRequestAction("fixture","Justificativa específica de retenção")).rejects.toThrow("não autorizado");
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("does not let an enrolled second factor be bypassed via a server action",async()=>{
    mocks.role.mockResolvedValue(true);mocks.aal.mockResolvedValue({data:{nextLevel:"aal2",currentLevel:"aal1"},error:null});
    await expect(createAuthorizedAdminClient()).rejects.toThrow("autenticação");
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("fails closed when the assurance service fails",async()=>{
    mocks.role.mockResolvedValue(true);mocks.aal.mockResolvedValue({data:null,error:new Error("unavailable")});
    await expect(createAuthorizedAdminClient()).rejects.toThrow("autenticação");
    expect(mocks.admin).not.toHaveBeenCalled();
  });
});
