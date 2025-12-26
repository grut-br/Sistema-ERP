const jwt = require('jsonwebtoken');

class AutenticarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ identificador, senha }) {
    if (!identificador || !senha) {
      throw new Error('Usuário/email e senha são obrigatórios.');
    }

    const usuario = await this.usuarioRepository.buscarPorEmailOuUsuario(identificador);
    if (!usuario) {
      throw new Error('Credenciais inválidas.'); // Mensagem genérica por segurança
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      throw new Error('Credenciais inválidas.');
    }

    // Gera o token JWT
    // Crie um arquivo de configuração para o 'jwt_secret' em um projeto real
    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      'seu_jwt_secret_super_secreto', // NUNCA exponha a chave secreta no código
      { expiresIn: '8h' } // Token expira em 8 horas
    );

    return {
      usuario: usuario.toJSON(),
      token,
    };
  }
}

module.exports = AutenticarUsuarioUseCase;