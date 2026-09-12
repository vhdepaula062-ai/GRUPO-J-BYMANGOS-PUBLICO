# ADR-008: Criptografia e Blind Index (HMAC) para Proteção de CPF

## Status
Aprovado

## Contexto
O CPF é um dado pessoal altamente sensível sob a ótica da LGPD e é o principal identificador civil de motoristas e proprietários de oficinas no Brasil. Armazená-lo em texto simples no banco expõe o ecossistema a graves penalidades e riscos de vazamento em caso de incidente. Porém, a aplicação precisa realizar buscas exatas por CPF no ato do cadastro e da validação de clientes para prevenir fraudes de duplicidade.

## Decisão
Implementar a estratégia de **Blind Indexing criptográfico**:
1. O CPF puro é sanitizado (remoção de pontos e traços) e validado por algoritmo de dígitos verificadores no pacote `@grupo-j/security`.
2. Para armazenamento seguro: o CPF é criptografado com **AES-256-GCM** utilizando chave gerenciada no servidor, gerando o campo `cpf_encrypted`.
3. Para buscas e garantia de unicidade: calcula-se um hash **HMAC-SHA256** utilizando uma chave secreta distinta (*Pepper/Salt* secreto do servidor), gerando o campo `cpf_blind_index`. A coluna possui restrição de unicidade `UNIQUE` e índice no PostgreSQL.
4. Para exibição em tela: gera-se a representação mascarada (`***.456.789-**`) gravada em `cpf_masked`.

## Consequências
* **Positivas**: Proteção criptográfica de dados pessoais mesmo em caso de despejo acidental de banco de dados (dump leak), busca indexada em tempo constante O(1) e conformidade integral com a LGPD.
