class DeletarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id) {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }
    return this.usuarioRepository.deletar(id);
  }
}
module.exports = DeletarUsuarioUseCase;