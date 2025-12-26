# 📘 Contexto do Projeto: ERP Suplementos

## 1. Visão Geral
Sistema ERP modular para gestão de lojas de suplementos.
**Stack:** Node.js, Express, Sequelize (MySQL).
**Arquitetura:** Modular Monolith (Clean Architecture/DDD).

## 2. Estrutura de Diretórios
- `src/modules/`: Módulos independentes (vendas, produtos, clientes, etc).
- `domain`: Regras de negócio e Entidades.
- `application`: Casos de uso (Lógica).
- `infrastructure`: Persistência (Repositories/Models) e Jobs.
- `interface`: Controllers e Rotas.

## 3. Regras de Negócio Críticas (Implementadas)

### 📦 Módulo Produtos (Estoque)
- **Catálogo:** Tabela `produtos` não tem quantidade.
- **Lotes:** Estoque real fica na tabela `lotes` (validade, custo).
- **FEFO:** Vendas baixam lotes com validade mais próxima.
- **Kits/Combos:** Produto pode ser Kit (`e_kit = true`). Não tem estoque físico.

### 💰 Módulo Vendas
- **Transação:** `VendaSequelize.repository` orquestra: Venda -> Pagamento -> Estoque -> Financeiro -> Fidelidade.
- **Pagamentos:** Usa **Strategy Pattern** e **Factory** (Pix, Dinheiro+Troco, Cartão+Taxas, Crédito em Carteira).
- **Integração:** Gera "Contas a Receber" (Fiado) e "Crédito" (Troco).

### 🔔 Módulo Notificações
- Gatilhos automáticos para Estoque Baixo, Validade e Contas.

## 4. Status Atual
- **Segurança:** JWT e Middleware de permissões implementados.
- **Cadastros:** Produtos (com imagem/código), Clientes (gênero), Fornecedores OK.
- **Financeiro:** Contas a Pagar/Receber e Carteira Digital OK.

## 5. ⚠️ KNOWN ISSUES & PRÓXIMOS PASSOS (Prioridade)

### 🔴 BUG: Lógica de Baixa de Estoque de Kits
- **Problema:** A venda de produtos do tipo "Kit" (`e_kit = true`) não está baixando corretamente o estoque dos componentes filhos na tabela `lotes`.
- **Suspeita:** A função recursiva `processarBaixaDeEstoque` no `VendaSequelize.repository.js` ou a validação no `registrarVenda.usecase.js` pode estar falhando ao identificar os componentes ou calcular a quantidade total.
- **Ação Necessária:** Debugar e corrigir a recursividade para garantir que a venda de 1 Kit baixe X unidades do componente no estoque real.

### 🚀 Próxima Feature
- Implementar o módulo de **Relatórios e Dashboards** (KPIs de vendas, Financeiro, Curva ABC).