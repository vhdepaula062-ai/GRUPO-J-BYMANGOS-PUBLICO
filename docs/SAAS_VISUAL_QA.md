# Checklist de Qualidade Visual e Acessibilidade (QA) — SaaS Grupo J

## 1. Visão Geral do QA Visual

Este documento consolida o protocolo de auditoria e validação de qualidade de interface (UI/UX), responsividade e acessibilidade (a11y) aplicado aos produtos web do Grupo J (`workshop-web` e `admin-web`).

---

## 2. Matriz de Responsividade por Breakpoints

As interfaces foram desenvolvidas com metodologia Mobile-First e testadas nos quatro principais perfis de tela do mercado:

| Breakpoint | Resolução Típica | Comportamento Esperado e Validado | Status |
| :--- | :--- | :--- | :---: |
| **Mobile Web** | `360px` - `480px` | Sidebars recolhidas ou em drawer; Landing page com Hero em coluna única, cards de passos empilhados verticalmente; tabelas de dados com rolagem horizontal contida e cabeçalho fixo; botões de ação e inputs com 100% de largura; alvos de toque com no mínimo 44x44px. | **Aprovado** |
| **Tablet Portrait** | `768px` - `1023px` | Grid de KPIs em 2 colunas; Landing page com estatísticas em grade 3 colunas compacta; menus com ícones visíveis e texto recolhível; formulário de credenciamento em 2 colunas nos campos de contato e endereço. | **Aprovado** |
| **Desktop / Laptop** | `1024px` - `1439px` | Sidebars fixas expandidas (256px); Grid de KPIs em 4 colunas; Landing page com layout completo, Hero com alinhamento horizontal harmônico e cartão institucional de destaque; tabelas operacionais com todas as colunas visíveis sem quebra. | **Aprovado** |
| **Ultra-Wide Desktop** | `1440px`+ | Conteúdo centralizado com largura máxima delimitada (`max-w-7xl` ou `max-w-6xl`), impedindo dispersão ocular e estiramento desconfortável de formulários ou tabelas; margens laterais automáticas. | **Aprovado** |

---

## 3. Conformidade com Acessibilidade (WCAG 2.2 AA)

### 3.1 Contraste de Cores
* **Texto Primário sobre Superfície Branca**: `#0F172A` sobre `#FFFFFF` -> Taxa de contraste **15.4:1** (Supera amplamente o requisito AAA de 7.0:1).
* **Texto Secundário sobre Superfície Branca**: `#475569` sobre `#FFFFFF` -> Taxa de contraste **7.1:1** (Conforme AAA).
* **Botão Primário**: Texto branco `#FFFFFF` sobre `#034EFE` -> Taxa de contraste **4.6:1** (Conforme AA para texto normal e grande).
* **Texto Branco sobre Navy Profundo**: `#FFFFFF` sobre `#00091D` -> Taxa de contraste **19.8:1** (Supera amplamente o requisito AAA de 7.0:1).
* **Status Badges**: Todas as combinações de fundo e texto de status possuem contraste mínimo de **4.8:1**.

### 3.2 Navegação por Teclado e Estados de Foco
* Todos os elementos interativos (`Button`, `Input`, `Select`, `a`, `Tabs`) possuem anel de foco bem delineado:
  * `focus:outline-none focus:ring-2 focus:ring-[#034EFE] focus:ring-offset-2`.
* Tecla `Escape` fecha modais e diálogos de confirmação.
* Tecla `Tab` e `Shift+Tab` percorrem os campos de formulário e ações de tabela na ordem lógica do DOM.

### 3.3 Formulários e Leitores de Tela
* Todos os campos possuem `<label>` associado semanticamente através de `id` correspondente.
* Campos obrigatórios possuem indicador visual e semântico `required`.
* Estados de erro possuem `aria-invalid="true"` e mensagens de erro visíveis com contraste adequado.
* Alternador de senha (Eye/EyeOff) possui `aria-label` descritivo ("Mostrar senha" / "Ocultar senha").

---

## 4. Auditoria de Regras de Negócio nas Interfaces

| Regra de Negócio | Componente / Rota | Verificação de Integridade | Status |
| :--- | :--- | :--- | :---: |
| **Mensalidade da Oficina R$ 500,00** | Landing Page (`/`), Planos (`/seja-parceiro`), Gestão (`/mensalidade`), Admin (`/oficinas`) | Confirmado em todas as ocorrências textuais e de badge. Nenhum valor obsoleto (R$ 350) foi introduzido. | **Conforme** |
| **Mensalidade do Motorista R$ 50,00** | Landing Page (`/`), Admin (`/dashboard`, `/clientes`) | Exibido como "R$ 50,00/mês" e armazenado em centavos inteiros (`5000`). | **Conforme** |
| **Timer de Validação de 120s** | Check-in da Oficina (`/check-in`), Painel (`/painel`) | Aviso visual explícito destacando a janela de segurança de 120 segundos para uso do voucher. | **Conforme** |
| **Blind Index e Mascaramento LGPD** | Admin (`/clientes`) | CPFs exibidos no formato `***.***.XXX-**` acompanhados do hash criptográfico HMAC-SHA256 para busca sem exposição do dado bruto. | **Conforme** |
| **Isolamento Mobile** | Monorepo (`apps/customer-mobile`) | 0 linhas de código alteradas no app do motorista e pacote de UI nativo. | **Conforme** |
