# Relatório de implementação real do Ecossistema Grupo J

Data da validação: 15/09/2026

## Resultado entregue no código

- Autenticação do aplicativo integrada ao Supabase Auth: cadastro, login, restauração segura da sessão, renovação, recuperação, verificação de e-mail e logout.
- Tokens do aplicativo armazenados com `expo-secure-store`.
- API passou a validar o Bearer token no Supabase e a consultar dados do usuário autenticado.
- Veículos, oficinas, troca de oficina, benefícios, vouchers, promoções, histórico, perfil, assinaturas e pagamentos deixaram de usar fixtures na API e no aplicativo.
- Benefício `Alinhamento (Convergência)` incluído no catálogo inicial.
- Plano do motorista configurado em R$ 50,00 por mês e plano da oficina em R$ 500,00 por mês na migration de fundação.
- Navegação inferior do Android usa ícones para Início, Benefícios, Oficinas, Veículos e Perfil.
- Aplicativo inicia no fluxo de autenticação e protege as rotas internas.
- Portal administrativo e portal de oficinas passaram a falhar de forma fechada quando Supabase não está configurado.
- Login dos portais não possui mais entrada automática de demonstração.
- MFA dos portais valida desafio TOTP real do Supabase.
- Cadastro de oficina, moderação, promoções, benefícios, check-in, perfil da oficina e painel de privacidade gravam ou consultam o Supabase.
- Sincronização administrativa só informa sucesso após confirmação do banco.
- Telas sem modelo persistente homologado, como agenda e suporte, foram explicitamente desabilitadas em vez de simular operações.
- Adaptadores PagSeguro e Mercado Pago não fabricam mais clientes, assinaturas ou eventos. Eles recusam cobranças até a implementação e homologação do provedor contratado.

## Banco e segurança

A migration `20260915000003_production_foundation.sql` adiciona:

- consentimentos;
- eventos idempotentes de webhook;
- ordens de serviço;
- solicitações de exclusão de conta;
- papéis e planos iniciais;
- catálogo inicial de benefícios;
- políticas RLS para as tabelas restantes;
- provisionamento de direitos por assinatura ativa;
- funções atômicas para troca de oficina, criação e resgate de voucher;
- validações de vínculo entre motorista, veículo e oficina.

CPF é protegido com AES-256-GCM e blind index HMAC. CNPJ usa blind index HMAC e máscara para exibição.

## Verificações concluídas

- `pnpm typecheck`: 17 de 17 tarefas aprovadas.
- `pnpm test`: 6 arquivos de teste e 16 testes aprovados.
- `pnpm build`: API, Admin SaaS e Workshop SaaS aprovados em build de produção.
- APK Android: assinatura v2 válida e alinhamento ZIP válido.
- APK: `artifacts/android/grupo-j-staging.apk`.
- Tamanho: 65.334.919 bytes.
- SHA-256: `D04136241A0800B18DBBA0EF48FEC8DA8B3F1136A8EE20DE75B8CBDD4A0CA292`.

## Bloqueios externos encontrados

O código está compilado, mas a sincronização online ainda não pode ser homologada neste ambiente:

1. `staging-api.grupoj.com.br`, URL embutida no APK, não resolve no DNS.
2. O Supabase disponível nas variáveis locais aponta para ambiente local e as chaves de produção são placeholders.
3. Não há projeto/credencial de hospedagem disponível e o repositório não possui remote Git configurado.
4. O gateway de pagamento não foi escolhido nem possui credenciais sandbox/webhook.
5. Não há credenciais de e-mail transacional, SMS/WhatsApp ou canal de suporte.
6. O APK atual usa assinatura Android de teste. A publicação final precisa do keystore de produção da empresa.

Por esses motivos, cadastro, login, cobrança e sincronização não podem ser declarados homologados em infraestrutura real. O health check da API informa indisponibilidade quando esses serviços não respondem.

## Dados necessários para concluir a homologação online

- URL, anon key e service-role key do projeto Supabase real;
- acesso ao provedor onde API, Admin e Workshop serão publicados e acesso ao DNS do domínio;
- decisão entre PagSeguro/PagBank e Mercado Pago;
- credenciais sandbox e segredo de webhook do gateway escolhido;
- domínio e remetente do e-mail transacional;
- keystore Android de produção e seus aliases/senhas, guardados fora do Git;
- número e horário reais do suporte, se esse módulo for ativado.

Após configurar esses itens, a sequência é: aplicar migrations, publicar API e portais, configurar DNS e webhooks, executar testes de integração ponta a ponta, recompilar o APK com a URL publicada e assinar com o keystore definitivo.
