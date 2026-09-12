# Matriz de Permissões (RBAC) — Ecossistema Digital Grupo J

## 1. Perfis de Acesso

O sistema define 12 perfis estritos de autorização distribuídos entre quatro esferas:

### Esfera Plataforma (Matriz Grupo J)
1. `platform_owner`: Proprietário do negócio, autoridade máxima operacional.
2. `platform_admin`: Administrador de operações diárias (oficinas, promoções, cadastros).
3. `finance_admin`: Gestor financeiro (faturamento, conciliação, descontos e isenções).
4. `support_admin`: Atendente de suporte aos clientes e oficinas parceiras.
5. `privacy_admin`: Encarregado de Proteção de Dados (DPO / LGPD).
6. `auditor`: Inspetor de conformidade, com acesso de leitura global estritamente auditada.

### Esfera Oficina Parceira (Multiempresa)
7. `workshop_owner`: Titular legal da oficina parceira credenciada.
8. `workshop_manager`: Gerente da oficina, operacionaliza serviços, agenda e equipe.
9. `workshop_attendant`: Atendente de recepção e check-in de veículos.
10. `workshop_finance`: Responsável financeiro da oficina (mensalidade e relatórios).

### Esfera Cliente Final
11. `customer`: Motorista titular da assinatura e proprietário de veículos.

### Esfera Break-Glass (Emergência Técnica)
12. `mangos_support`: Desenvolvedores e sustentação da Mangos. Desativado por padrão. Exige justificativa formal, autorização do proprietário, MFA obrigatório, gera banner visual permanente em tempo real e possui expiração estrita de sessão (TTL máx. 2 horas).

---

## 2. Matriz Granular de Recursos e Ações

**Legenda**:
* **C**: Create (Criar)
* **R**: Read (Ler)
* **U**: Update (Atualizar)
* **D**: Delete (Excluir/Inativar)
* **A**: Approve/Moderate (Aprovar/Moderar)
* **E**: Export (Exportar dados)
* **X**: Acesso Negado

| Recurso / Escopo | platform_owner | platform_admin | finance_admin | support_admin | privacy_admin | auditor | workshop_owner | workshop_manager | workshop_attendant | workshop_finance | customer | mangos_support (Break-glass) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Oficinas Globais** | C, R, U, D, A | C, R, U, A | R | R | R | R | X | X | X | X | R (Público) | R (Audited) |
| **Oficina Própria (Tenant)** | R, U | R | R | R | R | R | R, U | R, U | R | R | X | R (Audited) |
| **Membros da Oficina** | C, R, U, D | C, R, U | X | R | R | R | C, R, U, D | C, R, U | R | X | X | R (Audited) |
| **Clientes (Motoristas)** | R, U, E | R, U | R | R, U | R, U, D | R | R (Vinculados) | R (Vinculados) | R (Check-in) | X | R, U (Próprio) | R (Anonimizado) |
| **Veículos** | R, U | R, U | X | R, U | R | R | R (Atendimento) | R (Atendimento) | R (Atendimento) | X | C, R, U (Próprio) | R (Audited) |
| **Planos & Catálogo** | C, R, U, D | R, U | R | R | X | R | R | R | R | R | R | R (Audited) |
| **Assinaturas** | R, U, E | R, U | R, U, E | R | R | R | R (Própria B2B) | X | X | R (Própria B2B) | R (Própria B2C) | R (Audited) |
| **Pagamentos & Faturas** | R, E | R | R, U, E | R | R | R | R (Próprio) | X | X | R (Próprio) | R (Próprio) | R (Sem PAN/CVV) |
| **Isenções & Descontos** | C, R, U, A | R | C, R, U, A | R | X | R | X | X | X | X | R (Se aplicado) | X |
| **Benefícios (Regras)** | C, R, U, D | R, U | R | R | X | R | R | R | R | X | R | R (Audited) |
| **Resgate de Benefícios** | R, E | R | R | R | R | R | R, A | R, A | C, R, A | X | R (Próprio) | R (Audited) |
| **Check-in & Visitas** | R, E | R | X | R | R | R | C, R, U | C, R, U | C, R, U | X | R (Próprio) | R (Audited) |
| **Promoções (Criação)** | C, R, U, D | R, U | X | R | X | R | C, R, U, D | C, R, U | X | X | R (Ativas) | R (Audited) |
| **Promoções (Moderação)**| A, U, D | A, U, D | X | X | X | R | X | X | X | X | X | X |
| **Configuração Remota** | C, R, U, D, A | R, U | X | X | X | R | X | X | X | X | R (Consumidor) | R (Audited) |
| **Logs de Auditoria** | R, E | R | R (Fin) | R (Sup) | R (Priv) | R, E | R (Próprios) | X | X | X | X | R (Meta-Audit) |
| **LGPD (Exclusão/Export)**| A, E | X | X | X | C, R, U, A, E| R | X | X | X | X | C, R (Próprio) | X |

---

## 3. Diretrizes Rígidas de Implementação

1. **Validação em Nível de Banco (RLS)**: Cada consulta SQL inclui o identificador de organização ou usuário autenticado (`auth.uid()`). A interface web não pode anular ou desviar essa barreira.
2. **Imutabilidade Financeira**: Nenhum perfil, nem mesmo `platform_owner`, possui permissão para executar comandos `DELETE` ou `UPDATE` destrutivos sobre as tabelas `payments`, `invoices`, `refunds` e `audit_logs`. Erros operacionais são corrigidos exclusivamente por lançamentos compensatórios ou estornos com justificativa registrada.
3. **Restrição Absoluta de Credenciais**:
   - Dados sensíveis de cartão de crédito (PAN/CVV) e senhas criptografadas **são inacessíveis a todos os 12 perfis sem exceção**.
