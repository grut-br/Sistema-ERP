const UsuarioSequelizeRepository = require('../infrastructure/persistence/UsuarioSequelize.repository');

// Importa todos os casos de uso
const CriarUsuarioUseCase = require('../application/criarUsuario.usecase'); // Assumindo que você o criou
const BuscarUsuarioPorIdUseCase = require('../application/buscarUsuarioPorId.usecase');
const BuscarTodosUsuariosUseCase = require('../application/buscarTodosUsuarios.usecase');
const AtualizarUsuarioUseCase = require('../application/atualizarUsuario.usecase');
const DeletarUsuarioUseCase = require('../application/deletarUsuario.usecase');
const AutenticarUsuarioUseCase = require('../application/autenticarUsuario.usecase');
const MudarSenhaUseCase = require('../application/mudarSenha.usecase');
const AtribuirPermissaoUseCase = require('../application/atribuirPermissao.usecase');

class UsuarioController {
  constructor() {
    const repository = new UsuarioSequelizeRepository();
    
    this.criarUseCase = new CriarUsuarioUseCase(repository);
    this.buscarPorIdUseCase = new BuscarUsuarioPorIdUseCase(repository);
    this.buscarTodosUseCase = new BuscarTodosUsuariosUseCase(repository);
    this.atualizarUseCase = new AtualizarUsuarioUseCase(repository);
    this.deletarUseCase = new DeletarUsuarioUseCase(repository);

    this.autenticarUseCase = new AutenticarUsuarioUseCase(repository);
    this.mudarSenhaUseCase = new MudarSenhaUseCase(repository);
    this.atribuirPermissaoUseCase = new AtribuirPermissaoUseCase(repository);


    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);

    this.login = this.login.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.assignPermission = this.assignPermission.bind(this);
  }

  async create(req, res) {
    try {
      const dadosNovoUsuario = req.body;
      const usuarioLogado = req.usuario; 

      const usuarioSalvo = await this.criarUseCase.execute({ dadosNovoUsuario, usuarioLogado });
      res.status(201).json(usuarioSalvo.toJSON());
    } catch (error) { 
      console.error(error);
      res.status(403).json({ error: error.message }); 
    }
  }

  async getById(req, res) {
    try {
      const usuario = await this.buscarPorIdUseCase.execute(Number(req.params.id));
      res.status(200).json(usuario.toJSON());
    } catch (error) { res.status(404).json({ error: error.message }); }
  }

  async getAll(req, res) {
    try {
      const usuarios = await this.buscarTodosUseCase.execute();
      res.status(200).json(usuarios.map(u => u.toJSON()));
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  async update(req, res) {
    try {
      const usuario = await this.atualizarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(usuario.toJSON());
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  async delete(req, res) {
    try {
      await this.deletarUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  async login(req, res) {
    try {
      const { identificador, senha } = req.body;
      const resultado = await this.autenticarUseCase.execute({ identificador, senha });
      res.status(200).json(resultado);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      // O ID do usuário logado virá do token (implementaremos a seguir)
      const usuarioId = req.usuario.id; 
      const { senhaAntiga, novaSenha } = req.body;
      await this.mudarSenhaUseCase.execute({ usuarioId, senhaAntiga, novaSenha });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async assignPermission(req, res) {
    try {
      const usuarioLogado = req.usuario;
      const usuarioAlvoId = Number(req.params.id);
      const { novaPermissao } = req.body;
      const usuarioAtualizado = await this.atribuirPermissaoUseCase.execute({ usuarioLogado, usuarioAlvoId, novaPermissao });
      res.status(200).json(usuarioAtualizado.toJSON());
    } catch (error) {
      res.status(403).json({ error: error.message }); 
    }
  }
}
module.exports = UsuarioController;