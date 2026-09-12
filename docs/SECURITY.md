# Política de Segurança e Resposta a Incidentes — Grupo J

## 1. Princípios de Segurança em Profundidade

O ecossistema adota segurança em camadas:
1. **Camada de Borda**: Cloudflare / Vercel Edge com mitigação DDoS, WAF e TLS 1.3 obrigatório com HSTS.
2. **Camada de Aplicação**: Middlewares de proteção CSRF, sanitização de inputs, validação Zod no servidor, CORS estrito e limitação de taxa (Rate Limiting).
3. **Camada de Autenticação**: Supabase Auth, tokens JWT de curta duração, cookies HttpOnly e MFA obrigatório para administradores e oficinas.
4. **Camada de Banco de Dados**: PostgreSQL com Row Level Security (RLS) habilitada em todas as tabelas, transações atômicas e isolamento multi-tenant por hardware lógico.
5. **Camada de Dados Sensíveis**: Criptografia de CPF com Blind Index HMAC-SHA256, exclusão completa de dados de cartão de crédito (PAN/CVV) e trilha de auditoria append-only imutável.

---

## 2. Redação Automática de Logs (PII Sanitization)

Todos os logs estruturados emitidos pelo pacote `@grupo-j/observability` passam por um sanitizador obrigatório que ofusca:
* Números de cartão de crédito: `(?:\d[ -]*?){13,16}` -> `[REDACTED_PAN]`
* Códigos de segurança CVV: `\b\d{3,4}\b` -> `[REDACTED_CVV]`
* CPF: `\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b` -> `[REDACTED_CPF]`
* Senhas e tokens: Campos `password`, `token`, `secret`, `authorization` são mascarados para `[REDACTED_SECRET]`.

---

## 3. Plano de Resposta a Incidentes

Em caso de suspeita ou confirmação de incidente de segurança:
1. **Contenção Imediata**: Revogação de sessões ativas no Supabase Auth (`supabase.auth.admin.signOut()`), bloqueio de rotas afetadas via feature flag de emergência.
2. **Análise Forense**: Inspeção da trilha imutável em `audit_logs` e `admin_access_sessions`.
3. **Erradicação e Recuperação**: Aplicação de correção, rotação de segredos e restauração de dados a partir de backup Point-in-Time (PITR) se houver corrupção.
4. **Comunicação e Conformidade**: Notificação formal à Autoridade Nacional de Proteção de Dados (ANPD) e aos titulares afetados no prazo legal (art. 48 da LGPD), caso envolva risco relevante aos direitos dos indivíduos.
