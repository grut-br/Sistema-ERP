class MudarSenhaUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId, senhaAntiga, novaSenha }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    const senhaCorreta = await usuario.compararSenha(senhaAntiga);
    if (!senhaCorreta) {
      throw new Error('A senha antiga está incorreta.');
    }

    // Atribui a nova senha. O hook do model cuidará da criptografia.
    usuario.senha = novaSenha;
    
    return this.usuarioRepository.atualizar(usuario);
  }
}

module.exports = MudarSenhaUseCase;