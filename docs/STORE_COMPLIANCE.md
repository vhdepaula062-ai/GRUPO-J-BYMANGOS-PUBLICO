# Conformidade com Lojas de Aplicativos (Apple App Store & Google Play)

## 1. Classificação de Pagamentos e Modelo de Assinatura

### 1.1 Apple App Store (Diretrizes de Revisão da App Store)
* **Diretriz 3.1.3(e) — Bens e Serviços Físicos Fora do Aplicativo**:
  - A assinatura de R$ 50,00/mês do Grupo J dá direito estritamente a **serviços automotivos físicos presenciais** executados em oficinas mecânicas reais (ex.: alinhamento de direção, balanceamento de pneus, cristalização de para-brisa, check-up de suspensão).
  - De acordo com a Diretriz 3.1.3(e) e 3.1.5, bens e serviços físicos consumidos fora do ambiente digital **não devem** utilizar o mecanismo de In-App Purchase (IAP) da Apple, sendo permitido e exigido o uso de processadores de pagamento externos (Mercado Pago / Cartão de Crédito / Pix).
  - **Recomendação para Revisão**: No formulário de submissão do App Store Connect, anexar declaração clara explicando que a assinatura concede acesso a manutenções automotivas em oficinas credenciadas físicas.

### 1.2 Google Play Store (Política de Pagamentos)
* Conforme a política de faturamento do Google Play, produtos ou serviços físicos não se qualificam para o Google Play Billing e devem utilizar meios de pagamento alternativos/externos.

---

## 2. Requisitos Mandatórios para Aprovação

### 2.1 Exclusão Completa de Conta dentro do App (Diretriz Apple 5.1.1(v) e Google Play)
* O aplicativo **deve oferecer** uma opção explícita, facilmente localizável no perfil (`Perfil -> Privacidade e Segurança -> Excluir Minha Conta`).
* O fluxo não pode direcionar o usuário para um link web externo confuso. O motorista confirma a exclusão no próprio app.
* O backend cancela imediatamente as assinaturas ativas no gateway e anonimiza os dados pessoais de acordo com a LGPD.

### 2.2 Política de Privacidade Transparente
* URL pública permanente com certificado SSL válido (`https://grupoj.com.br/privacidade`).
* Descrição exata de todos os dados coletados (localização geográfica para busca de oficinas parceiras, dados do veículo e histórico de manutenções).

### 2.3 Conta de Demonstração para os Revisores das Lojas
* Credenciais de teste funcionais com dados sintéticos aprovados devem ser fornecidas nas notas da submissão:
  - Usuário Motorista Demo: `revisor.apple@grupoj.com.br` / `SenhaSegura123!`
  - O usuário demo já possui um veículo cadastrado e uma oficina vinculada para permitir a inspeção de todas as abas sem exigir pagamento real.

### 2.4 Permissões em Tempo de Execução (Just-In-Time)
* Nenhuma permissão de sistema operacional (Câmera, Localização, Notificações) é solicitada na inicialização do app.
* A câmera é solicitada exclusivamente no momento em que o usuário fotografa a placa do veículo ou lê um comprovante.
* A localização é solicitada exclusivamente ao clicar em "Buscar oficinas próximas no mapa".
