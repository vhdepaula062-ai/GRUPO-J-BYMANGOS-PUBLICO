# ADR-003: Supabase PostgreSQL e Row Level Security (RLS) Mandatória

## Status
Aprovado

## Contexto
O Grupo J reúne múltiplas oficinas parceiras concorrentes entre si na mesma plataforma. O vazamento de dados de clientes, orçamentos ou faturamento entre oficinas representaria dano comercial e jurídico irreparável. Além disso, a plataforma gerencia assinaturas financeiras e requer controle transacional atômico ACID.

## Decisão
Adotar **PostgreSQL gerenciado via Supabase** com **Row Level Security (RLS)** ativada obrigatoriamente em 100% das tabelas de negócio expostas. Cada consulta é filtrada no nível do motor do banco com base no tenant (`organization_id`) e no perfil do usuário (`auth.uid()`).

## Consequências
* **Positivas**: Segurança em profundidade garantida por hardware lógico (mesmo se um endpoint falhar na checagem de parâmetros, o PostgreSQL não retorna dados de outra oficina), suporte a autenticação JWT integrada, storage de evidências fotográficas e triggers de auditoria.
* **Mitigações**: Testes automatizados de negação de RLS escritos em pgTAP / SQL para validar regressões em cada migration.
