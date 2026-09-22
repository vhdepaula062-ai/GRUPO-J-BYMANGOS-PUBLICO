import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Deprecated webhook is closed until the central provider integration is homologated. */
export async function POST() {
  return NextResponse.json({ error: "Gateway não homologado. Nenhum pagamento ou assinatura foi alterado." }, { status: 503 });
}
