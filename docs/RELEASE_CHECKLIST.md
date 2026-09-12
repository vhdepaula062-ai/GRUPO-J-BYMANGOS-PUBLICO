# Checklist de Lançamento e Homologação (Release Checklist)

Este checklist deve ser validado integralmente antes de qualquer promoção de código para o ambiente de Produção.

---

## 1. Segurança e Privacidade
- [ ] Nenhuma credencial, segredo ou chave privada está presente no repositório (`.env` versionado ou commit).
- [ ] Todas as tabelas expostas no PostgreSQL possuem Row Level Security (RLS) habilitada e testada.
- [ ] O adaptador `FakePaymentGateway` está categoricamente desabilitado em modo de produção.
- [ ] O CPF de clientes é pesquisado unicamente via HMAC blind index e armazenado de forma criptografada.
- [ ] Nenhum dado de cartão de crédito (PAN completo, CVV) é recebido ou armazenado nos servidores do Grupo J.
- [ ] A exclusão e exportação de dados (LGPD) está funcional no aplicativo do motorista.
- [ ] Os cabeçalhos de segurança (CSP, HSTS, X-Content-Type-Options, CORS restrito) estão configurados nas rotas web.

---

## 2. Qualidade e Integração Contínua
- [ ] `pnpm typecheck` executou com sucesso (0 erros de tipagem TypeScript strict).
- [ ] `pnpm lint` executou com sucesso (0 warnings e 0 erros).
- [ ] 100% dos testes unitários e de integração passaram com sucesso (`pnpm test`).
- [ ] O build de produção dos sites (`admin-web`, `workshop-web`, `api`) foi concluído sem falhas.
- [ ] A configuração nativa do aplicativo mobile foi validada com `expo doctor`.

---

## 3. Conformidade com Lojas Mobile (Apple & Google)
- [ ] Declaração clara e explícita nas notas de revisão de que as assinaturas cobrem **serviços automotivos físicos presenciais** (Diretrizes Apple 3.1.3(e) e 3.1.5).
- [ ] Credenciais de demonstração (`revisor.apple@grupoj.com.br`) ativas com veículo e oficina vinculados.
- [ ] Fluxo de exclusão de conta acessível nativamente em `Perfil -> Excluir Minha Conta`.
- [ ] Permissões de câmera e localização solicitadas de forma contextualizada (*Just-In-Time*).
