import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest,NextResponse} from "next/server";
const state=vi.hoisted(()=>({resend:vi.fn(),limit:vi.fn()}));
vi.mock("@/lib/auth",()=>({getPublicDatabase:()=>({auth:{resend:state.resend}})}));
vi.mock("@/lib/rate-limiter",()=>({checkRateLimit:state.limit}));
import {POST} from "../app/api/v1/auth/resend-confirmation/route";
import {CUSTOMER_EMAIL_CONFIRMATION_URL} from "../lib/email-confirmation";
const request=(body:unknown)=>new NextRequest("http://localhost/api/v1/auth/resend-confirmation",{method:"POST",body:JSON.stringify(body)});
describe("email confirmation resend",()=>{
 beforeEach(()=>{state.resend.mockReset().mockResolvedValue({error:null});state.limit.mockReset().mockResolvedValue(null);});
 it("normalizes the email and uses only the fixed trusted signup redirect",async()=>{const r=await POST(request({email:" Person@Example.com "}));expect(r.status).toBe(200);expect(state.resend).toHaveBeenCalledWith({type:"signup",email:"person@example.com",options:{emailRedirectTo:CUSTOMER_EMAIL_CONFIRMATION_URL}});});
 it.each([{email:"invalid"},{email:"person@example.com",redirectTo:"https://attacker.example"},null])("rejects invalid input or caller redirects",async body=>{expect((await POST(request(body))).status).toBe(422);expect(state.resend).not.toHaveBeenCalled();});
 it("handles malformed JSON without a server error",async()=>{const r=await POST(new NextRequest("http://localhost/api/v1/auth/resend-confirmation",{method:"POST",body:"{"}));expect(r.status).toBe(422);});
 it("does not disclose whether the account exists",async()=>{const success=await (await POST(request({email:"person@example.com"}))).json();state.resend.mockResolvedValue({error:{status:400,code:"user_not_found",message:"private provider details"}});const response=await POST(request({email:"person@example.com"}));expect(response.status).toBe(200);expect((await response.json()).data).toEqual(success.data);});
 it("does not call the mail provider after the shared rate limit",async()=>{state.limit.mockResolvedValue(NextResponse.json({status:429},{status:429}));expect((await POST(request({email:"person@example.com"}))).status).toBe(429);expect(state.resend).not.toHaveBeenCalled();});
 it("reports provider throttling",async()=>{state.resend.mockResolvedValue({error:{status:429}});expect((await POST(request({email:"person@example.com"}))).status).toBe(429);});
 it.each([{status:500,message:"private SMTP credentials"},{status:403,code:"email_address_not_authorized",message:"private SMTP configuration"}])("does not claim mail delivery when the provider is unavailable",async error=>{state.resend.mockResolvedValue({error});const r=await POST(request({email:"person@example.com"}));expect(r.status).toBe(503);expect(await r.text()).not.toContain("private SMTP");});
});
