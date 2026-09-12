# ADR-006: Multi-tenancy e Isolamento de Dados de Oficinas

## Status
Aprovado

## Contexto
O modelo de negócio do Grupo J conecta dezenas a centenas de oficinas parceiras. Cada oficina é uma pessoa jurídica independente que gerencia seus próprios funcionários, agenda, clientes vinculados e faturamento de serviços.

## Decisão
Implementar multi-tenancy no modelo de **esquema compartilhado com particionamento lógico por `organization_id`**:
1. Toda tabela que armazena dados específicos de uma oficina contém uma coluna estrangeira não-nula: `organization_id UUID NOT NULL REFERENCES organizations(id)`.
2. O token JWT emitido para membros de oficina carrega no payload a claim assinada `organization_id`.
3. Políticas de RLS no PostgreSQL vinculam a leitura e escrita à igualdade `organization_id = (auth.jwt() ->> 'org_id')::uuid`.
4. Os endpoints de API também validam o `organization_id` no contexto da requisição para rejeição em camada preliminar.

## Consequências
* **Positivas**: Custo de infraestrutura unificado, facilidade de consolidação analítica para o proprietário do Grupo J e segurança imposta pelo motor do PostgreSQL.
