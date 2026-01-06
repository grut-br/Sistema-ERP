-- Migration: Pagamentos Parciais e Histórico
-- Data: 2026-01-06
-- Descrição: Adiciona suporte a pagamentos parciais com rastreabilidade

-- =============================================================================
-- 1. ADICIONAR COLUNA valor_pago EM lancamentos
-- =============================================================================
ALTER TABLE lancamentos
  ADD COLUMN valor_pago DECIMAL(10,2) DEFAULT 0 AFTER valor;

-- =============================================================================
-- 2. CRIAR TABELA historico_pagamentos
-- =============================================================================
CREATE TABLE IF NOT EXISTS historico_pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_lancamento INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento ENUM('DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA', 'CREDITO') DEFAULT 'DINHEIRO',
  observacao VARCHAR(255),
  data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_lancamento) REFERENCES lancamentos(id) ON DELETE CASCADE
);

-- =============================================================================
-- VERIFICAÇÃO
-- =============================================================================
-- DESCRIBE lancamentos;
-- DESCRIBE historico_pagamentos;
