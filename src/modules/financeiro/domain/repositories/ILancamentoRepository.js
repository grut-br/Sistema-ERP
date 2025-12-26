class ILancamentoRepository {
  salvar(lancamento) { throw new Error('Método não implementado.'); }
  buscarPorId(id) { throw new Error('Método não implementado.'); }
  atualizar(lancamento) { throw new Error('Método não implementado.'); }
  deletar(id) { throw new Error('Método não implementado.'); }
  listarTodos() { throw new Error('Método não implementado.'); }
  listarPorCliente(clienteId) { throw new Error('Método não implementado.'); }
  buscarContasPendentesPorVencimento(dias) { throw new Error('Método não implementado.'); }
}
module.exports = ILancamentoRepository;