-- Migration: Categorias Financeiras e Recorrência de Lançamentos
-- Data: 2026-01-06
-- Descrição: Adiciona suporte a categorização de despesas/receitas e recorrência automática

-- =============================================================================
-- 1. CRIAR TABELA categorias_financeiras
-- =============================================================================
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
  cor VARCHAR(7) DEFAULT '#6B7280',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. ALTERAR TABELA lancamentos
-- =============================================================================
ALTER TABLE lancamentos
  ADD COLUMN id_categoria INT NULL AFTER id_venda,
  ADD COLUMN frequencia ENUM('NENHUMA', 'SEMANAL', 'MENSAL', 'ANUAL') DEFAULT 'NENHUMA' AFTER id_categoria,
  ADD COLUMN id_pai INT NULL AFTER frequencia;

-- Adicionar chaves estrangeiras
ALTER TABLE lancamentos
  ADD CONSTRAINT fk_lancamento_categoria 
    FOREIGN KEY (id_categoria) REFERENCES categorias_financeiras(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_lancamento_pai 
    FOREIGN KEY (id_pai) REFERENCES lancamentos(id) ON DELETE SET NULL;

-- =============================================================================
-- 3. SEED - CATEGORIAS ESSENCIAIS
-- =============================================================================
INSERT INTO categorias_financeiras (nome, tipo, cor) VALUES
  ('Venda de Produtos', 'RECEITA', '#22C55E'),
  ('Fiado Cliente', 'RECEITA', '#3B82F6'),
  ('Pagamento Fornecedor', 'DESPESA', '#EF4444'),
  ('Aluguel/Condomínio', 'DESPESA', '#F97316'),
  ('Salários', 'DESPESA', '#8B5CF6'),
  ('Água/Luz/Internet', 'DESPESA', '#06B6D4');

-- =============================================================================
-- VERIFICAÇÃO
-- =============================================================================
-- SELECT * FROM categorias_financeiras;
-- DESCRIBE lancamentos;
