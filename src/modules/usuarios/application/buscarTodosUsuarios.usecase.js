class BuscarTodosUsuariosUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute() {
    return this.usuarioRepository.buscarTodos();
  }
}
module.exports = BuscarTodosUsuariosUseCase;