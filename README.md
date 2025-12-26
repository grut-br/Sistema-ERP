# 🏋️ Sistema ERP - Gestão de Suplementos

Sistema de gestão empresarial (ERP) desenvolvido sob medida para as necessidades específicas de lojas de suplementos. O projeto foca na resolução de problemas complexos de estoque (validade, kits e fracionamento) utilizando uma arquitetura robusta e moderna.

## 🚀 Visão Geral

Diferente de ERPs genéricos, este sistema aborda dores críticas do nicho de suplementação, como o controle rigoroso de validade (FEFO) e a composição de Kits promocionais sem duplicidade de estoque físico.

O projeto adota uma abordagem **"Local-First"** de desenvolvimento, garantindo performance e integridade dos dados.

## 🛠 Tech Stack

O projeto é um Monólito Modular dividido em Frontend e Backend.

### 🎨 Frontend (Modern Web)
Interface moderna, responsiva e focada na experiência do usuário.
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Linguagem:** TypeScript / React 19
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components:** Shadcn/UI (Radix Primitives + Lucide Icons)
* **Gerenciamento de Estado/Form:** React Hook Form + Zod
* **Visualização de Dados:** Recharts

### ⚙️ Backend (API REST)
Focado em regras de negócio complexas e desacoplamento.
* **Runtime:** Node.js
* **Framework:** Express.js
* **ORM:** Sequelize
* **Banco de Dados:** MySQL
* **Segurança:** JWT & Bcrypt
* **Jobs:** Node-cron (para automações e notificações)

---

## 🏛 Arquitetura e Design

O sistema segue a arquitetura **Modular Monolith** baseada em princípios de **Clean Architecture** e **DDD (Domain-Driven Design)**.

### Estrutura de Pastas (Backend)
* `src/modules/`: Módulos independentes (Vendas, Produtos, Financeiro).
* `domain/`: Regras de negócio puras e Entidades.
* `application/`: Casos de uso (Lógica da aplicação).
* `infrastructure/`: Persistência, Repositórios e Jobs.
* `interface/`: Controllers e Rotas.

### Design Patterns Aplicados
* **Strategy Pattern:** Utilizado no módulo de Vendas para orquestrar diferentes formas de pagamento (Pix, Cartão, Dinheiro, Crédito em Loja).
* **Factory Pattern:** Criação de instâncias de métodos de pagamento.
* **Repository Pattern:** Abstração da camada de dados (MySQL).

---

## ✨ Funcionalidades Críticas

### 📦 Gestão de Estoque (FEFO)
* **Controle por Lotes:** O sistema não gerencia apenas "quantidade", mas sim lotes com data de validade e custos específicos.
* **FEFO (First Expired, First Out):** Baixa automática dos lotes com validade mais próxima durante a venda.
* **Kits/Combos:** Suporte a produtos virtuais (Kits) que abatem estoque dos itens individuais apenas no momento da venda.

### 💰 Financeiro & Vendas
* Orquestração de transação completa: Venda -> Pagamento -> Baixa de Estoque -> Lançamento Financeiro -> Fidelidade.
* Gestão de Contas a Pagar/Receber.
* Carteira Digital para clientes (Crédito de troco ou devolução).

### 🔔 Notificações Inteligentes
* Alertas automáticos para estoque baixo.
* Avisos de produtos próximos ao vencimento.
* Lembretes de contas a pagar.

---

## 🔧 Como Executar

### Pré-requisitos
* Node.js (v20+)
* MySQL Server

### 1. Clonar o repositório
```bash
git clone [https://github.com/seu-usuario/sistema-erp.git](https://github.com/seu-usuario/sistema-erp.git)
cd sistema-erp
```

### 2. Configurar Backend
```bash
cd backend
npm install
# Crie um arquivo .env configurando as variáveis do MySQL
npm start
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
npm run dev
```

### 📝 Status do Projeto
✅ Segurança: Autenticação JWT e RBAC implementados.

✅ Cadastros: Clientes, Fornecedores e Produtos (com Lotes).

✅ Financeiro: Carteira Digital e Contas a Pagar/Receber.

🚧 Dashboard: Em desenvolvimento (Integração com Recharts).

🚧 Módulo de Vendas: Refinamento do PDV.

Autor: [Pedro Lucas Reis] - Estudante de Sistemas de Informação
