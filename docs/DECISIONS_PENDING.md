# Registro de Decisões Pendentes — Ecossistema Grupo J

Este documento registra todas as definições de produto, marca e comerciais ainda não confirmadas pelo cliente final. Cada item descreve o contexto, a opção provisória adotada nesta fundação e o impacto no código.

---

## 1. Ativos de Marca e Manual de Identidade Visual
* **Contexto**: O arquivo `Grupo-J-Master-Brief.md`, logotipos em vetor (SVG), imagens de referência e manual de identidade visual oficial não estavam disponíveis no diretório do projeto no momento da inicialização.
* **Opção Provisória Adotada**: 
  - Criação da pasta receptora `docs/references/` para receber o master brief e manuais de marca futuramente.
  - Implementação do design system em `@grupo-j/design-tokens` utilizando a paleta aproximada informada no prompt mestre:
    - Azul Principal: `#034EFE` (`rgb(3, 78, 254)`)
    - Azul-Marinho Profundo: `#00091D`
    - Cinza Claro: `#DEDEDE`
    - Branco / Off-White predominante.
* **Impacto**: Nenhuma tela ou componente utiliza cores fixas ou logotipos estáticos de baixa resolução; todos consomem tokens semânticos (`brand.primary`, `surface.default`), permitindo substituição imediata assim que os ativos oficiais forem entregues.
* **Responsável**: Joaquim / Cliente Grupo J.
* **Status**: Aguardando Envio. Data: 12/09/2026.

---

## 2. Pacote Definitivo de Benefícios e Periodicidades
* **Contexto**: O conjunto exato de benefícios preventivos (ex.: alinhamento, balanceamento, rodízio de pneus, cristalização, regulagem de faróis) e seus prazos (mensal, semestral ou anual) não foram fechados.
* **Opção Provisória Adotada**:
  - Modelado como entidades dinâmicas relacionais (`benefit_definitions` e `benefit_plan_rules`) e configuráveis via módulo de Configuração Remota, com suporte a ciclos `monthly`, `quarterly`, `semiannual` e `annual`.
* **Impacto**: A regra de validação não possui listas estáticas de benefícios *hardcoded*. O cadastro de um novo benefício ou alteração de periodicidade ocorre via painel administrativo.
* **Responsável**: Joaquim / Cliente Grupo J.
* **Status**: Em Aberto. Data: 12/09/2026.

---

## 3. Inclusão de Troca de Óleo e Filtro no Plano Base
* **Contexto**: Pendente definição se óleo lubrificante e filtro de óleo farão parte do plano de R$ 50/mês ou se serão contratados à parte com desconto exclusivo para assinantes.
* **Opção Provisória Adotada**:
  - Modelado como benefício com atributo booleano `is_included_in_base_plan` na tabela `benefit_definitions`.
* **Impacto**: Pode ser ativado ou desativado por versão de plano sem necessidade de nova migração de banco de dados.
* **Responsável**: Joaquim / Cliente Grupo J.
* **Status**: Em Aberto. Data: 12/09/2026.

---

## 4. Modelo de Repasse e Compensação das Oficinas Parceiras
* **Contexto**: Não está definido se as oficinas receberão um repasse por cada benefício resgatado (modelo de tabela fixa ou variável) ou se a remuneração da oficina baseia-se exclusivamente no fluxo de vendas adicionais (upsell de peças/serviços corretivos).
* **Opção Provisória Adotada**:
  - Tabela `billing_rules` com campos `reimbursement_type` (`FIXED_FEE`, `UPSELL_ONLY`, `REVENUE_SHARE`) e valor `reimbursement_cents` configurável.
* **Impacto**: O módulo financeiro registra o evento de resgate permitindo cálculo futuro de liquidação sem quebrar a integridade transacional.
* **Responsável**: Joaquim / Mangos.
* **Status**: Em Aberto. Data: 12/09/2026.

---

## 5. Gateway de Pagamento Definitivo em Produção
* **Contexto**: A integração definitiva com credenciais oficiais (Mercado Pago, Asaas, Iugu ou Pagar.me) ainda não foi contratada pelo cliente.
* **Opção Provisória Adotada**:
  - Criação da interface abstrata `PaymentGateway` em `@grupo-j/payments` com adaptador `FakePaymentGateway` para testes/desenvolvimento e casca estruturada para `MercadoPagoPaymentGateway`.
  - Bloqueio em tempo de compilação/inicialização para impedir que o adaptador Fake seja carregado em ambiente `production`.
* **Impacto**: O domínio não possui acoplamento com o SDK de nenhum fornecedor específico.
* **Responsável**: Joaquim / Proprietário Grupo J.
* **Status**: Em Aberto. Data: 12/09/2026.

---

## 6. Nomenclatura Comercial: "Auto App" versus "Auto Center"
* **Contexto**: O prompt indica indefinição se a marca se posicionará como aplicativo de tecnologia ("Auto App") ou como ecossistema de centros automotivos integrados ("Auto Center").
* **Opção Provisória Adotada**:
  - Os textos de apresentação e títulos são controlados pelo pacote `@grupo-j/design-tokens` e pela tabela `content_blocks`, permitindo ajuste imediato.
* **Responsável**: Joaquim / Marketing.
* **Status**: Em Aberto. Data: 12/09/2026.
