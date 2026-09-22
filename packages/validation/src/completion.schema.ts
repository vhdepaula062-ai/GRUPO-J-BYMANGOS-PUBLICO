import { z } from "zod";
export const portalRequestSchema=z.object({kind:z.enum(["support","privacy"]),subject:z.string().trim().min(5).max(160),body:z.string().trim().min(5).max(4000)});
export const portalReplySchema=z.object({id:z.string().uuid(),body:z.string().trim().min(5).max(4000),status:z.enum(["open","in_progress","answered","closed"]).optional()});
export const profileUpdateSchema=z.object({fullName:z.string().trim().min(3).max(160),phone:z.union([z.string().trim().regex(/^\+?[\d\s()-]{10,20}$/),z.literal(""),z.null()]).transform(v=>v||null)}).strict();
export const settingsSchema=z.object({controllerName:z.string().trim().max(180),controllerDocument:z.string().trim().max(30),privacyEmail:z.union([z.literal(""),z.string().email()]),supportEmail:z.union([z.literal(""),z.string().email()]),privacyText:z.string().max(40000),termsText:z.string().max(40000),legalPublished:z.boolean()}).strict();
export const serviceTransitionSchema=z.object({id:z.string().uuid(),status:z.enum(["in_progress","completed","canceled"]),notes:z.string().trim().max(4000).default(""),odometer:z.number().int().min(0).max(10000000).nullable().default(null)});
export const workshopProfileUpdateSchema=z.object({tradeName:z.string().trim().min(3).max(160),legalName:z.string().trim().min(3).max(180),email:z.string().email(),phone:z.string().trim().regex(/^\+?[\d\s()-]{10,20}$/)}).strict();
