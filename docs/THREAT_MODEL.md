# Modelo de Ameaças (STRIDE) — Ecossistema Digital Grupo J

## 1. Visão Geral e Metodologia

Este documento analisa as vulnerabilidades e vetores de ataque potenciais contra o ecossistema Grupo J utilizando a metodologia **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) e define as contramedidas implementadas no código e na infraestrutura.

---

## 2. Análise de Ameaças e Vetores Críticos

### 2.1 Vazamento de Dados entre Oficinas (Cross-Tenant Leakage)
* **Ameaça**: Uma oficina parceira mal-intencionada ou comprometida tenta ler dados de clientes, atendimentos ou faturamento de outra oficina credenciada alterando identificadores (`organization_id`) em chamadas de API.
* **Classificação STRIDE**: *Information Disclosure* / *Elevation of Privilege*.
* **Contramedidas Implementadas**:
  1. **Row Level Security (RLS) Mandatória no PostgreSQL**: Cada consulta SQL interceptada pelo Supabase valida a cláusula `organization_id = auth.jwt() ->> 'org_id'`. Mesmo que a API falhe em filtrar, o motor do banco rejeita o retorno de registros de terceiros com zero linhas.
  2. **Testes Automatizados de Invasão**: Suite de testes pgTAP simulando queries forjadas entre tenants distintos com validação de negação de acesso.
  3. **Validação na Camada de Negócio**: Decorators/Middlewares de verificação de tenant em cada rota da API.

### 2.2 Fraude de QR Code e Resgate Falso de Benefício
* **Ameaça**: Um motorista captura o screenshot de um QR Code de benefício e o compartilha com terceiros para múltiplos resgates, ou uma oficina simula um resgate de serviço sem a presença real do veículo.
* **Classificação STRIDE**: *Tampering* / *Spoofing*.
* **Contramedidas Implementadas**:
  1. **QR Code Dinâmico com TTL Curto**: O código gerado no app do motorista contém um token criptográfico assinado com validade máxima de 120 segundos. Após esse período, o código expira e novo token deve ser solicitado.
  2. **Nonce de Uso Único (Idempotência)**: Cada resgate consome um `nonce` aleatório gravado no banco de dados. Tentativas de reutilização geram erro imediato de resgate duplicado.
  3. **Evidência Fotográfica Obrigatória**: Para homologar o benefício, o atendente da oficina deve anexar a foto da placa do veículo e do hodômetro/peça no momento do check-in.
  4. **Trava de Ciclo e Saldo**: Validação atômica de saldo de `entitlements` dentro da transação SQL (`available_quantity > 0`).

### 2.3 Falsificação de Webhooks de Pagamento (Fake Webhook Injection)
* **Ameaça**: Um atacante envia requisições HTTP falsas para `/api/v1/webhooks/payments` simulando que uma assinatura de R$ 50 ou R$ 500 foi paga com sucesso.
* **Classificação STRIDE**: *Spoofing* / *Tampering*.
* **Contramedidas Implementadas**:
  1. **Validação de Assinatura Criptográfica HMAC**: Toda requisição de webhook é validada contra o segredo compartilhado fornecido pelo gateway no header de assinatura (ex.: `x-signature`). Requisições sem assinatura válida são rejeitadas com HTTP 401.
  2. **Consulta Reversa ao Gateway**: Antes de transicionar o status da assinatura para `ACTIVE`, o backend consulta ativamente a API oficial do gateway utilizando o identificador da transação recebido para confirmar a autenticidade do pagamento.
  3. **Idempotência**: Processamento deduplicado via tabela `idempotency_keys`.

### 2.4 Roubo de Sessão e Credential Stuffing
* **Ameaça**: Ataques automatizados de força bruta contra contas de administradores e donos de oficina, ou roubo de tokens de sessão.
* **Classificação STRIDE**: *Spoofing*.
* **Contramedidas Implementadas**:
  1. **MFA Obrigatório**: Segundo fator de autenticação (TOTP) compulsório para todas as contas dos perfis `platform_owner`, `platform_admin` e `workshop_owner`.
  2. **Cookies HttpOnly com SameSite=Strict**: Na web, os tokens de autenticação não são salvos em `localStorage` (vulnerável a XSS), mas sim em cookies seguros com flags `HttpOnly`, `Secure` e `SameSite=Strict`.
  3. **Armazenamento Seguro Mobile**: No app mobile, tokens de refresh são salvos exclusivamente no `Expo SecureStore` (KeyStore no Android, Keychain no iOS).
  4. **Rate Limiting Progressivo**: Bloqueio de IP após 5 tentativas consecutivas de login inválidas.

### 2.5 Abuso do Acesso Técnico Break-Glass (Mangos Support)
* **Ameaça**: Engenheiros da desenvolvedora técnica acessando dados confidenciais ou alterando registros de negócio sem autorização expressa do cliente.
* **Classificação STRIDE**: *Elevation of Privilege* / *Repudiation*.
* **Contramedidas Implementadas**:
  1. O perfil `mangos_support` é desabilitado por padrão no banco de dados.
  2. A ativação depende de aprovação formal com chave de autorização temporária e registro do número de chamado/motivo.
  3. O tempo de vida (TTL) da sessão é limitado a no máximo 120 minutos.
  4. Banner visual de alerta em vermelho cintilante é exibido permanentemente no painel administrativo enquanto a sessão break-glass estiver ativa.
  5. 100% dos comandos e páginas acessadas são gravados em trilha de auditoria criptográfica imutável em `admin_access_sessions`.
  6. Dados sigilosos (cartões, senhas e CPFs completos) permanecem ofuscados e inacessíveis mesmo sob modo break-glass.
