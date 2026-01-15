class AbrirCaixaUseCase {
  constructor(caixaRepository) {
    this.caixaRepository = caixaRepository;
  }

  async execute({ idUsuario, saldoInicial }) {
    const sessaoAberta = await this.caixaRepository.buscarSessaoAberta();
    if (sessaoAberta) {
      throw new Error('Já existe um caixa aberto.');
    }

    const novaSessao = await this.caixaRepository.abrirSessao({
      id_usuario: idUsuario,
      saldo_inicial: saldoInicial,
      status: 'ABERTO',
      data_abertura: new Date()
    });

    return novaSessao;
  }
}

module.exports = AbrirCaixaUseCase;
