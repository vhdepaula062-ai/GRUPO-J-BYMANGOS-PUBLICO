# Contrato e Convenções de API — Ecossistema Digital Grupo J

## 1. Convenções Globais da API

* **Protocolo**: HTTPS exclusivo com TLS 1.3.
* **Formato de Dados**: `application/json` (UTF-8) em requisições e respostas.
* **Versionamento**: Prefixo de rota na URL: `/api/v1/...`.
* **Datas e Horários**: Formato ISO 8601 em UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
* **Valores Monetários**: Sempre números inteiros representando **centavos** (`amount_cents`), acompanhados da moeda explícita (`currency: "BRL"`).
* **Identificadores**: UUID v4 não sequenciais.

---

## 2. Padrão de Cabeçalhos HTTP

| Cabeçalho | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT>` | Sim (rotas autenticadas) | Token JWT emitido pelo Supabase Auth. |
| `Idempotency-Key`| `String (UUID)`| Sim (mutações financeiras/resgates) | Identificador único da requisição para evitar duplicidade. |
| `X-Request-ID`   | `String (UUID)`| Não (gerado se ausente) | Identificador de correlação para rastreabilidade de logs. |
| `X-Client-Version`| `String`      | Sim (apps mobile) | Versão semântica do cliente (ex.: `1.0.0`) para validação de versão mínima. |

---

## 3. Padrão de Respostas e Tratamento de Erros (RFC 7807)

Todas as falhas da API seguem o padrão **Problem Details for HTTP APIs (RFC 7807)**:

```json
{
  "type": "https://api.grupoj.com.br/v1/errors/workshop-change-cooldown",
  "title": "Período de Carência Ativo",
  "status": 422,
  "detail": "A troca de oficina só pode ser realizada após 30 dias da última vinculação.",
  "instance": "/api/v1/workshops/assignments",
  "code": "WORKSHOP_CHANGE_COOLDOWN",
  "next_change_allowed_at": "2026-10-12T14:30:00.000Z",
  "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

### Códigos HTTP Padronizados:
* `200 OK`: Sucesso em consulta ou atualização.
* `201 Created`: Recurso criado com sucesso.
* `204 No Content`: Mutação executada sem payload de retorno.
* `400 Bad Request`: Payload malformado ou JSON inválido.
* `401 Unauthorized`: Token de autenticação ausente, expirado ou inválido.
* `403 Forbidden`: Usuário autenticado sem privilégios para o recurso (RBAC/RLS).
* `404 Not Found`: Recurso não localizado.
* `409 Conflict`: Conflito de estado ou violação de unicidade.
* `422 Unprocessable Entity`: Falha de validação de negócio/Zod.
* `429 Too Many Requests`: Limite de taxa de requisições excedido.
* `500 Internal Server Error`: Erro inesperado no servidor (dados sigilosos omitidos do cliente).

---

## 4. Paginação Padronizada

Listagens utilizam paginação baseada em cursor para alta performance:

```
GET /api/v1/workshops?limit=20&cursor=eyJpZCI6IjEyMyJ9
```

**Payload de Resposta**:
```json
{
  "data": [ ... ],
  "pagination": {
    "has_more": true,
    "next_cursor": "eyJpZCI6IjQ1NiJ9",
    "total_count": 142
  }
}
```

---

## 5. Endpoints Fundamentais da API Central

### 5.1 Health Check
* `GET /api/health`
  - Resposta: `{ "status": "healthy", "version": "1.0.0", "timestamp": "2026-09-12T18:00:00Z", "services": { "database": "up", "storage": "up" } }`

### 5.2 Autenticação & Sessão
* `GET /api/v1/auth/session`
  - Retorna dados do perfil autenticado, papéis ativos, permissões e organização vinculada.

### 5.3 Oficinas Parceiras
* `GET /api/v1/workshops` (Listagem pública com geolocalização e filtros)
* `GET /api/v1/workshops/:id` (Detalhes da oficina credenciada)
* `POST /api/v1/workshops/assignments` (Vinculação de oficina pelo motorista com validação dos 30 dias)

### 5.4 Assinaturas e Planos
* `GET /api/v1/plans` (Planos ativos do catálogo)
* `GET /api/v1/subscriptions/current` (Assinatura do motorista ou da oficina)
* `POST /api/v1/subscriptions` (Criação de assinatura)

### 5.5 Benefícios e Resgates
* `GET /api/v1/benefits/entitlements` (Saldos disponíveis no ciclo do motorista)
* `POST /api/v1/benefits/generate-voucher` (Geração do QR code com TTL de 120s)
* `POST /api/v1/benefits/redeem` (Validação e resgate pelo atendente da oficina)

### 5.6 Webhooks de Pagamento
* `POST /api/v1/webhooks/payments` (Recepção idempotente de eventos do Gateway)

### 5.7 Configuração Remota
* `GET /api/v1/remote-config` (Retorna a versão ativa das configurações de negócio)
