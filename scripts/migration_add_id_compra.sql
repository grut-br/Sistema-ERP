-- Adiciona coluna id_compra à tabela lancamentos para vincular despesas a compras
-- Versão simplificada sem foreign key constraint para evitar erros

ALTER TABLE lancamentos
ADD COLUMN id_compra INT NULL AFTER id_venda;

-- Atualiza lançamentos existentes de compras (opcional, se houver)
-- Isso tenta vincular automaticamente lançamentos com descrição "Compra de Fornecedor"
UPDATE lancamentos l
INNER JOIN compras c ON l.descricao LIKE CONCAT('Compra de Fornecedor - Pedido #', c.id, '%')
SET l.id_compra = c.id
WHERE l.tipo = 'DESPESA' AND l.id_compra IS NULL;

-- Verificação: Lista lançamentos vinculados a compras
SELECT id, descricao, valor, id_compra 
FROM lancamentos 
WHERE id_compra IS NOT NULL;
