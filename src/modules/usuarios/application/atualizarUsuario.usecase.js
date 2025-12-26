class AtualizarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id, dadosParaAtualizar) {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }
    // Atualiza apenas os campos fornecidos
    Object.assign(usuario, dadosParaAtualizar);
    return this.usuarioRepository.atualizar(usuario);
  }
}
module.exports = AtualizarUsuarioUseCase;