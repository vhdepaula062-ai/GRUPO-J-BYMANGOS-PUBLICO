// Server Component — lista real de motoristas (clientes) do Supabase
import React from "react";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  Badge,
  ShieldCheck,
  Download,
  Users
} from "@grupo-j/ui-web";
import { getMotoristas } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { ClienteSearchBar } from "./ClienteSearchBar";

export default async function ClientesAdminPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const search = searchParams?.q ?? "";
  const motoristas = await getMotoristas(search);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Motoristas Assinantes"
        subtitle="Clientes com assinatura ativa de R$ 50/mês. CPF protegido por AES-256-GCM + Blind Index HMAC."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
              Exportar CSV
            </Button>
          </div>
        }
      />

      <ClienteSearchBar defaultValue={search} />

      {motoristas.length === 0 && !search ? (
        /* Estado vazio — primeiros motoristas virão pelo app mobile */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-[#034EFE]">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum motorista assinante ainda</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Os motoristas se cadastram e assinam (R$ 50/mês) diretamente pelo aplicativo mobile.
            Assim que o primeiro assinar, ele aparecerá aqui com os dados protegidos por criptografia.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold">
            <ShieldCheck size={14} />
            <span>Todos os CPFs são armazenados cifrados — conformidade LGPD total.</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <DataTable
            columns={[
              {
                key: "full_name",
                header: "Motorista",
                render: (item) => (
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{item.full_name}</span>
                    <span className="block text-xs text-slate-400">{item.email}</span>
                  </div>
                )
              },
              {
                key: "cpf_masked",
                header: "CPF (Protegido)",
                render: (item) => (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-slate-700">
                      {item.cpf_masked ?? "***.***.***-**"}
                    </span>
                    <Badge variant="success" size="sm" className="text-[9px]">
                      AES-256
                    </Badge>
                  </div>
                )
              },
              {
                key: "created_at",
                header: "Assinante desde",
                render: (item) => (
                  <span className="text-xs text-slate-600 font-medium">{formatDate(item.created_at)}</span>
                )
              },
              {
                key: "subscription_status",
                header: "Assinatura",
                render: (item) => (
                  <StatusBadge status={item.subscription_status === "active" ? "Ativa" : "R$ 50,00/mês"} size="sm" />
                )
              },
              {
                key: "actions",
                header: "Ações",
                align: "right",
                render: () => (
                  <Button variant="outline" size="xs">
                    Ver Perfil
                  </Button>
                )
              }
            ]}
            data={motoristas}
            keyExtractor={(item) => item.id}
            emptyTitle="Nenhum motorista localizado"
            emptyDescription="Tente outro termo de busca."
          />
        </div>
      )}

      {motoristas.length > 0 && (
        <p className="text-xs text-slate-500 text-right">
          {motoristas.length} motorista{motoristas.length !== 1 ? "s" : ""} encontrado{motoristas.length !== 1 ? "s" : ""}
          {search ? ` para "${search}"` : ""}
        </p>
      )}
    </div>
  );
}
