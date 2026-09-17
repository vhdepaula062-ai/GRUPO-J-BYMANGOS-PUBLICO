import React from "react";
import { getPendingPromotions, getWorkshops } from "@/lib/queries";
import { PromocoesModerator } from "./PromocoesModerator";

export const dynamic = "force-dynamic";

export default async function PromocoesAdminPage() {
  const [promotions, workshops] = await Promise.all([
    getPendingPromotions(),
    getWorkshops()
  ]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Moderação & Curadoria de Ofertas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Aprovação de promoções e cortesias submetidas pelas oficinas parceiras para exibição no app dos motoristas.
        </p>
      </div>

      <PromocoesModerator promotions={promotions} workshops={workshops} />
    </div>
  );
}
