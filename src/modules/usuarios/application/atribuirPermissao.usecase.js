class AtribuirPermissaoUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioLogado, usuarioAlvoId, novaPermissao }) {
    if (usuarioLogado.tipo !== 'SUPER_ADMIN') {
      throw new Error('Apenas Super Admins podem atribuir permissões.');
    }

    // Regra: Garante que só exista um SUPER_ADMIN
    if (novaPermissao === 'SUPER_ADMIN') {
      const superAdminExistente = await this.usuarioRepository.buscarPorTipo('SUPER_ADMIN');
      // Permite a promoção se o super admin for o próprio alvo (caso raro)
      if (superAdminExistente && superAdminExistente.id !== usuarioAlvoId) { 
        throw new Error('Já existe um SUPER_ADMIN no sistema.');
      }
    }

    const usuarioAlvo = await this.usuarioRepository.buscarPorId(usuarioAlvoId);
    if (!usuarioAlvo) {
      throw new Error('Usuário alvo não encontrado.');
    }

    usuarioAlvo.tipo = novaPermissao;
    return this.usuarioRepository.atualizar(usuarioAlvo);
  }
}

module.exports = AtribuirPermissaoUseCase;