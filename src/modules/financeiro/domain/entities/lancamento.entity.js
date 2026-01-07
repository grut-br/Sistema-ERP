class Lancamento {
  constructor({ id, descricao, valor, tipo, status, dataVencimento, dataPagamento, idCliente, idVenda, idCompra, idCategoria, frequencia, idPai, valorPago }) {
    this.id = id;
    this.descricao = descricao;
    this.valor = parseFloat(valor) || 0;
    this.tipo = tipo;
    this.status = status || 'PENDENTE';
    this.dataVencimento = dataVencimento;
    this.dataPagamento = dataPagamento;
    this.idCliente = idCliente;
    this.idVenda = idVenda;
    this.idCompra = idCompra;
    // Novos campos para categorização e recorrência
    this.idCategoria = idCategoria || null;
    this.frequencia = frequencia || 'NENHUMA';
    this.idPai = idPai || null;
    // Campo para pagamentos parciais
    this.valorPago = parseFloat(valorPago) || 0;

    this.validar();
  }

  /**
   * Retorna o saldo restante a pagar
   * @returns {number}
   */
  get saldoRestante() {
    return Math.max(0, this.valor - this.valorPago);
  }

  validar() {
    if (!this.descricao || this.valor <= 0 || !this.tipo) {
      throw new Error('Descrição, valor (maior que zero) e tipo são obrigatórios.');
    }
    const frequenciasValidas = ['NENHUMA', 'SEMANAL', 'MENSAL', 'ANUAL'];
    if (this.frequencia && !frequenciasValidas.includes(this.frequencia)) {
      throw new Error('Frequência inválida. Use: NENHUMA, SEMANAL, MENSAL ou ANUAL.');
    }
  }

  /**
   * Registra um pagamento (parcial ou total)
   * @param {number} valorAPagar - Valor a ser pago (default = saldo restante)
   * @returns {boolean} true se o lançamento foi quitado completamente
   */
  registrarPagamento(valorAPagar = null) {
    if (this.status === 'PAGO') {
      throw new Error('Este lançamento já foi pago.');
    }

    const valorPagamento = valorAPagar !== null ? parseFloat(valorAPagar) : this.saldoRestante;
    
    if (valorPagamento <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero.');
    }
    
    if (valorPagamento > this.saldoRestante + 0.01) { // Tolerância de centavo
      throw new Error(`Valor excede o saldo restante (R$ ${this.saldoRestante.toFixed(2)}).`);
    }

    this.valorPago += valorPagamento;

    // Verifica se foi quitado (com tolerância de centavo)
    if (this.valorPago >= this.valor - 0.01) {
      this.status = 'PAGO';
      this.dataPagamento = new Date();
      this.valorPago = this.valor; // Ajusta para evitar diferenças de arredondamento
      return true; // Quitado
    }

    return false; // Ainda pendente
  }

  // Método legado para compatibilidade (marca como pago total)
  pagar() {
    return this.registrarPagamento(this.saldoRestante);
  }

  /**
   * Clona o lançamento para o próximo período baseado na frequência
   * @returns {Lancamento} Novo lançamento com data futura
   */
  clonarParaProximoPeriodo() {
    if (this.frequencia === 'NENHUMA') {
      throw new Error('Este lançamento não é recorrente.');
    }

    const novaDataVencimento = this._calcularProximaData();
    
    // Atualiza descrição com o mês (opcional)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesNovo = meses[novaDataVencimento.getMonth()];
    let novaDescricao = this.descricao;
    
    // Remove mês antigo da descrição se existir (formato "- Mês")
    const regexMes = / - (Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/;
    novaDescricao = novaDescricao.replace(regexMes, '');
    novaDescricao = `${novaDescricao} - ${mesNovo}`;

    return new Lancamento({
      descricao: novaDescricao,
      valor: this.valor,
      tipo: this.tipo,
      status: 'PENDENTE',
      dataVencimento: novaDataVencimento,
      dataPagamento: null,
      idCliente: this.idCliente,
      idVenda: null, // Lançamento recorrente não está vinculado à venda original
      idCategoria: this.idCategoria,
      frequencia: this.frequencia,
      idPai: this.id, // Referência ao lançamento original
    });
  }

  /**
   * Calcula a próxima data de vencimento baseado na frequência
   * @returns {Date}
   */
  _calcularProximaData() {
    const dataBase = this.dataVencimento ? new Date(this.dataVencimento) : new Date();
    
    switch (this.frequencia) {
      case 'SEMANAL':
        dataBase.setDate(dataBase.getDate() + 7);
        break;
      case 'MENSAL':
        dataBase.setMonth(dataBase.getMonth() + 1);
        break;
      case 'ANUAL':
        dataBase.setFullYear(dataBase.getFullYear() + 1);
        break;
      default:
        break;
    }
    
    return dataBase;
  }
}

module.exports = Lancamento;
