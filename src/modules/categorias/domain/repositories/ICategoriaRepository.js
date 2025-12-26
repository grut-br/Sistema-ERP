// A classe é declarada APENAS AQUI.
class ICategoriaRepository {
  salvar(categoria) { throw new Error('Método "salvar" não implementado.'); }
  buscarPorId(id) { throw new Error('Método "buscarPorId" não implementado.'); }
  buscarTodas() { throw new Error('Método "buscarTodas" não implementado.'); }
  atualizar(categoria) { throw new Error('Método "atualizar" não implementado.'); }
  deletar(id) { throw new Error('Método "deletar" não implementado.'); }
}

module.exports = ICategoriaRepository;