# Classificação de Dados e Governança LGPD / PCI DSS — Grupo J

## 1. Níveis de Classificação de Dados

Os dados processados pelo ecossistema digital do Grupo J são categorizados em 7 níveis rigorosos de sensibilidade:

| Nível | Categoria | Descrição / Exemplos | Armazenamento | Transmissão | Retenção |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **N1** | **Público** | Nome das oficinas parceiras, endereços públicos, catálogo de serviços e planos, termos de uso públicos. | Sem restrição. CDN/Cache liberado. | HTTPS / Cleartext permitido em landing | Permanente enquanto ativo |
| **N2** | **Interno** | Métricas agregadas de faturamento, volumetria de resgates, logs técnicos sanitizados, identificadores UUID. | Banco de dados transacional com RLS. | TLS 1.3 obrigatório | 5 anos para relatórios |
| **N3** | **Confidencial** | Margens de negociação com oficinas, contratos de parceria comercial, regras de split/reembolso. | Criptografia em repouso (AES-256 no banco). | TLS 1.3 autenticado | Duração contratual + 5 anos |
| **N4** | **Dados Pessoais (LGPD)** | Nome completo, e-mail, telefone, placas de veículos, histórico de manutenções de clientes. | RLS estrito. Mascaramento parcial em visualizações de suporte. | TLS 1.3 obrigatório | Duração da conta + prazo prescricional (5 anos) |
| **N5** | **Dado Pessoal Crítico (CPF)** | Cadastro de Pessoa Física de motoristas e donos de oficina. | **Blind Index (HMAC-SHA256)** para busca + cifra AES-256 com chave em KMS. Proibido em logs/URLs. | TLS 1.3 com payload restrito | Duração da conta + obrigação legal |
| **N6** | **Financeiro (PCI DSS)** | Token de cartão gerado pelo gateway, 4 últimos dígitos do cartão, bandeira, histórico de faturas. | **Proibido armazenar PAN ou CVV**. Apenas identificadores tokenizados retornados pelo gateway. | TLS 1.3 exclusivo com gateway | 5 anos (auditoria fiscal) |
| **N7** | **Segredos de Infraestrutura** | Chaves privadas de API, segredos de webhook HMAC, JWT secrets, credenciais de banco de dados. | Gerenciador de Segredos / Variáveis de Ambiente (Vercel / Supabase Vault). | Proibido trafegar na rede pública | Rotação periódica (90 dias) |

---

## 2. Tratamento Específico de CPF (LGPD e Prevenção de Fraude)

Para cumprir as diretrizes da LGPD sem inviabilizar buscas eficientes por clientes:

```
[CPF de Entrada: "123.456.789-00"]
               │
       Normalização ("12345678900")
               ├─────────────────────────────────────────┐
               ▼                                         ▼
   HMAC-SHA256 com Chave Secreta B            Criptografia AES-GCM com Chave A
               │                                         │
               ▼                                         ▼
   [cpf_blind_index (Busca/Unicidade)]        [cpf_encrypted (Persistência)]
```

* **Proibições Rígidas**:
  - O CPF nunca é registrado em arquivos de log (`access.log`, `error.log`).
  - O CPF nunca é passado como parâmetro de consulta em URLs (Query Strings).
  - O CPF nunca é utilizado como nome de arquivos ou imagens enviadas ao storage.
  - Para visualização em telas de atendimento, exibe-se apenas a representação mascarada: `***.456.789-**`.

---

## 3. Conformidade com PCI DSS (Dados de Cartão)

O Grupo J adota o modelo de conformidade **PCI DSS SAQ A**:
1. Toda a coleta de dados de cartão de crédito ocorre via formulário seguro (Hosted Fields / SDK seguro do Gateway de Pagamentos).
2. O servidor do Grupo J **nunca toca, recebe ou armazena** o Primary Account Number (PAN) completo, data de validade completa ou o Card Verification Value (CVV).
3. O banco de dados armazena unicamente:
   - `gateway_customer_id`: Identificador do cliente no gateway.
   - `gateway_payment_method_id`: Token seguro representativo da forma de pagamento.
   - `card_brand`: Bandeira (ex.: Visa, Mastercard, Elo).
   - `card_last_four`: Últimos 4 dígitos para identificação amigável do motorista.
   - `card_exp_month` e `card_exp_year`: Mês e ano de vencimento.

---

## 4. Direitos do Titular (LGPD Art. 18)

O ecossistema implementa endpoints e interfaces nativas para:
* **Confirmação de existência e acesso aos dados**: Exportação completa em formato estruturado (JSON/CSV) através de requisição autenticada.
* **Correção de dados incompletos ou inexatos**: Permitida no perfil do motorista e da oficina.
* **Exclusão de conta e anonimização**:
  - Disponível nativamente no aplicativo mobile (`apps/customer-mobile`) em conformidade com as diretrizes das lojas de aplicativos.
  - Dados pessoais não essenciais são apagados.
  - Registros fiscais e contábeis de faturamento são mantidos anonimizados (pseudonimização) pelo período legal de 5 anos (Código Tributário Nacional e Código de Defesa do Consumidor).
