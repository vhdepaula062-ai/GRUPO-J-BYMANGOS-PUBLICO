import {beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest,NextResponse} from "next/server";
const state=vi.hoisted(()=>({create:vi.fn(),remove:vi.fn(),resend:vi.fn(),from:vi.fn(),limit:vi.fn(),writes:[] as string[],failProfile:false}));
vi.mock("@/lib/auth",()=>({getAdminDatabase:()=>({from:state.from,auth:{admin:{createUser:state.create,deleteUser:state.remove}}}),getPublicDatabase:()=>({auth:{resend:state.resend}})}));
vi.mock("@/lib/rate-limiter",()=>({checkRateLimit:state.limit}));
vi.mock("@grupo-j/security",async(importOriginal)=>({...await importOriginal<typeof import("@grupo-j/security")>(),CpfSecurity:{normalize:(s:string)=>s,assertProtectionKeys:vi.fn(),computeBlindIndex:()=>"blind",encrypt:()=>"cipher",mask:()=>"***"}}));
import {POST} from "../app/api/v1/auth/register/route";
import {CUSTOMER_EMAIL_CONFIRMATION_URL} from "../lib/email-confirmation";
const body={fullName:"Fixture",email:"fixture@example.test",phone:"0000000000",password:"fixture-password",cpf:"52998224725",termsAccepted:true,privacyAccepted:true};
const request=()=>new NextRequest("http://localhost/api/v1/auth/register",{method:"POST",body:JSON.stringify(body)});
describe("registration identity ownership",()=>{
 beforeEach(()=>{
  vi.clearAllMocks();state.writes=[];state.failProfile=false;
  process.env.CPF_ENCRYPTION_KEY="fixture";process.env.CPF_BLIND_INDEX_PEPPER="fixture";
  state.limit.mockResolvedValue(null);state.create.mockResolvedValue({data:{user:{id:"new-identity"}},error:null});state.remove.mockResolvedValue({error:null});state.resend.mockResolvedValue({error:null});
  state.from.mockImplementation((table:string)=>{
   let write=false;
   const result=()=>({data:table==="customers"?{id:"customer"}:table==="roles"?{id:"role"}:null,error:write&&table==="profiles"&&state.failProfile?new Error("private database detail"):null});
   const q:any={};for(const m of ["select","eq","order","limit"])q[m]=()=>q;
   for(const m of ["upsert","insert"])q[m]=()=>{write=true;state.writes.push(table);return q;};
   q.maybeSingle=q.single=async()=>result();q.then=(resolve:any,reject:any)=>Promise.resolve(result()).then(resolve,reject);return q;
  });
 });
 it.each(["unconfirmed","confirmed"])("duplicate %s account never receives writes or deletion",async()=>{
  state.create.mockResolvedValue({data:{user:null},error:{message:"User already registered",status:422}});
  expect((await POST(request())).status).toBe(409);expect(state.writes).toEqual([]);expect(state.remove).not.toHaveBeenCalled();expect(state.resend).not.toHaveBeenCalled();
 });
 it("creates an unconfirmed identity and sends only the fixed confirmation link",async()=>{
  const response=await POST(request());expect(response.status).toBe(201);
  expect(state.create).toHaveBeenCalledWith(expect.objectContaining({email_confirm:false}));
  expect(state.resend).toHaveBeenCalledWith({type:"signup",email:body.email,options:{emailRedirectTo:CUSTOMER_EMAIL_CONFIRMATION_URL}});
  expect((await response.json()).data).toMatchObject({emailConfirmationRequired:true,accessToken:null,confirmationEmailSent:true});
 });
 it("cleans up only the identity atomically created by this request and hides internal errors",async()=>{
  state.failProfile=true;const r=await POST(request());expect(r.status).toBe(500);expect(await r.text()).not.toContain("private database detail");expect(state.remove).toHaveBeenCalledWith("new-identity");
 });
 it.each(["returned","thrown"])("mail failure (%s) preserves the provisioned account and offers resend",async mode=>{
  if(mode==="returned")state.resend.mockResolvedValue({error:{message:"smtp private"}});else state.resend.mockRejectedValue(new Error("smtp private"));
  const r=await POST(request());expect(r.status).toBe(201);expect((await r.json()).data.confirmationEmailSent).toBe(false);expect(state.remove).not.toHaveBeenCalled();
 });
 it("does not create an account after rate limiting",async()=>{state.limit.mockResolvedValue(NextResponse.json({}, {status:429}));expect((await POST(request())).status).toBe(429);expect(state.create).not.toHaveBeenCalled();});
 it("rejects extra privileged fields and invalid CPF before using the service credential",async()=>{
  for(const payload of [{...body,role:"admin"},{...body,cpf:"12345678901"}]){
   const req=new NextRequest("http://localhost/api/v1/auth/register",{method:"POST",body:JSON.stringify(payload)});
   expect((await POST(req)).status).toBe(422);
  }
  expect(state.create).not.toHaveBeenCalled();expect(state.from).not.toHaveBeenCalled();
 });
});
