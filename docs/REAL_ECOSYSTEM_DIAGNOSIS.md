# Diagnóstico para operação real do Ecossistema Grupo J

Data do diagnóstico: 15/09/2026

## Estado encontrado

O monorepo compila e o APK Android é gerado, mas a compilação não comprova uma operação integrada. A implementação atual mistura interfaces finais, dados de demonstração e integrações incompletas. Por isso, o estado anterior não pode ser classificado como produção.

Antes desta etapa foi criado um checkpoint externo em `C:\Users\knzao\GrupoJ-checkpoints\2026-09-15-pre-real-integration`, contendo o diff dos arquivos rastreados, os arquivos não rastreados e o commit-base.

## Inventário por categoria

| Categoria | Evidência no código | Risco | Tratamento |
|---|---|---|---|
| Simulação indevida | API importa `@grupo-j/test-utils`; login emite Base64 com prefixo `gj_jwt_`; telas móveis usam `setTimeout`; vouchers e webhooks usam `Set` em memória | Qualquer senha entra, dados somem ao reiniciar e os três produtos divergem | Remover dependência de fixtures de código executável e usar Supabase/Auth/banco |
| Fallback perigoso | Middlewares liberam rotas quando Supabase está ausente; painéis mesclam arquivo local e banco; clientes Supabase usam chaves `placeholder` | Painéis administrativos podem abrir sem sessão e exibir estado falso | Falhar de forma fechada, com página de configuração/erro, sem liberar área protegida |
| Fixture válida | `packages/test-utils`, testes unitários e futuros seeds locais identificados como desenvolvimento | Baixo, desde que isolado | Manter apenas em testes e em seed local explícito |
| Integração parcial | Classes de Mercado Pago/PagSeguro fabricam IDs sem chamada HTTP; webhook não valida assinatura nem persiste idempotência | Cobrança e acesso não refletem o provedor | Manter contrato do gateway, bloquear uso incompleto e implementar adaptador após escolha/credenciais oficiais |
| Consulta incompatível | Painéis consultam `billing_cycle`, `amount_cents`, `payment_transactions`, `audit_log_entries`, `org_members`, `organization_id`, `valid_from` e `valid_until`, inexistentes no esquema atual | Telas vazias ou erro em runtime | Alinhar consultas ao esquema canônico e criar entidades realmente necessárias |
| Segurança incompleta | RLS habilitado em 19 de 38 tabelas; funções `SECURITY DEFINER` sem `search_path`; CPF usa segredos padrão; ausência de fluxo atômico para vouchers | Vazamento entre organizações, escalada e fraude por concorrência | Nova migração com RLS completo, funções seguras e operações atômicas |
| Configuração enganosa | URLs locais/chaves previsíveis como padrão e template de produção com gateway `fake` | Deploy pode iniciar em modo inseguro | Validar configuração e proibir defaults inseguros fora de desenvolvimento/teste |
| Sincronização aparente | Botão de sincronização mede disponibilidade, mas não reconcilia dados; outbox existe sem consumidor | Interface afirma sincronização sem realizá-la | Banco será a fonte única; operações síncronas críticas e outbox persistente para eventos externos |

## Fluxos críticos auditados

### Aplicativo do motorista

- Login, cadastro, recuperação e verificação são apenas navegação local.
- Tokens não são armazenados com proteção do sistema operacional.
- Perfil, veículo, oficina, benefícios, promoções e histórico vêm de constantes.
- O voucher exibido é aleatório e não nasce de uma transação no servidor.
- A URL embutida do APK aponta para um host de staging que não resolve publicamente no momento do diagnóstico.

### SaaS da oficina

- O middleware aceita acesso se a configuração estiver ausente.
- O cadastro grava também em arquivo local e cria blind index previsível.
- O check-in aceita códigos especiais de demonstração.
- Agenda, suporte e cobrança mantêm estado somente no navegador.
- Algumas consultas usam tabelas/colunas que não existem.

### SaaS administrativo

- O middleware aceita acesso sem Supabase configurado.
- KPIs e oficinas mesclam banco com registros locais predefinidos.
- Operações de benefícios e promoções criam cópias locais se o servidor falhar.
- Auditoria, privacidade e financeiro consultam entidades inexistentes ou mantêm estado no navegador.

### API, banco e pagamentos

- As rotas de autenticação não usam Supabase Auth.
- Rotas de domínio retornam fixtures, datas fixas e IDs aleatórios.
- A deduplicação de webhook e voucher não é persistente.
- Os adaptadores de pagamentos existentes são esqueletos, apesar dos nomes de produção.
- O esquema tem boa base, mas carece de cobertura RLS completa, gatilho de provisionamento de usuário e funções transacionais para regras críticas.

## Ordem de implementação

1. Endurecer configuração, autenticação e autorização compartilhadas.
2. Completar o esquema, RLS, auditoria, consentimentos e funções atômicas.
3. Substituir os endpoints críticos por consultas reais com isolamento por usuário e organização.
4. Conectar o aplicativo a esses endpoints, com sessão em armazenamento seguro e rotas protegidas.
5. Remover os atalhos de autenticação e os stores locais dos dois painéis.
6. Implementar o gateway escolhido em sandbox, webhooks assinados e reconciliação.
7. Executar testes de unidade, integração, RLS, build web e build Android.

## Dependências externas para homologação final

- Projeto Supabase acessível e migrations aplicadas.
- Domínio público da API com TLS.
- Escolha definitiva do gateway e credenciais de sandbox/produção.
- URLs de retorno e webhook cadastradas no gateway.
- Provedor de e-mail/SMS e textos jurídicos aprovados.
- Conta de publicação e chave de assinatura Android de produção.

Sem esses itens é possível concluir a implementação e os testes locais, mas não é correto declarar cobrança, e-mail/SMS, webhook público ou sincronização em nuvem como homologados.
