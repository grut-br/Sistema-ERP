const Usuario = require('../domain/entities/usuario.entity');

class CriarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ dadosNovoUsuario, usuarioLogado }) {
    const { tipo: tipoNovoUsuario } = dadosNovoUsuario;
    const { tipo: tipoUsuarioLogado } = usuarioLogado;

    // Regra 1: Ninguém pode criar um SUPER_ADMIN diretamente
    if (tipoNovoUsuario === 'SUPER_ADMIN') {
      throw new Error('Não é possível criar um SUPER_ADMIN. Promova um usuário existente.');
    }

    // Regra 2: Um ADMIN só pode ser criado por um SUPER_ADMIN
    if (tipoNovoUsuario === 'ADMIN' && tipoUsuarioLogado !== 'SUPER_ADMIN') {
      throw new Error('Apenas um SUPER_ADMIN pode criar um ADMIN.');
    }

    // Regra 3: VENDEDOR ou ESTOQUISTA só por ADMIN ou SUPER_ADMIN
    const tiposValidos = ['VENDEDOR'];
    if (tiposValidos.includes(tipoNovoUsuario)) {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(tipoUsuarioLogado)) {
        throw new Error('Apenas ADMINS ou SUPER_ADMINS podem criar Vendedores.');
      }
    }

    const novoUsuario = new Usuario(dadosNovoUsuario);
    return this.usuarioRepository.salvar(novoUsuario);
  }
}

module.exports = CriarUsuarioUseCase;