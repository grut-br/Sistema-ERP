class IUsuarioRepository {
  salvar(user) { throw new Error('Método não implementado.'); }
  buscarPorId(id) { throw new Error('Método não implementado.'); }
  buscarTodos() { throw new Error('Método não implementado.'); }
  buscarPorEmailOuUsuario(identificador) { throw new Error('Método não implementado.'); }
  atualizar(user) { throw new Error('Método não implementado.'); }
  deletar(id) { throw new Error('Método não implementado.'); }
  buscarPorTipo(tipo) { throw new Error('Método não implementado.'); }
}
module.exports = IUsuarioRepository;