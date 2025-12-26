// Interface (simulada em JS)
class IProcessadorPagamento {
  processar(valor, dadosExtras = {}) {
    throw new Error('Método processar() deve ser implementado.');
  }
}
module.exports = IProcessadorPagamento;