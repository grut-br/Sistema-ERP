'use client'

import { useState, useEffect } from 'react'
import { X, User, CreditCard, ShoppingBag, AlertCircle, Trophy, Clock, Plus, Trash2, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ModalRecebimento } from './ModalRecebimento'
import { ModalPagamentoGeral } from './ModalPagamentoGeral'
import { ModalDetalhesVenda } from './ModalDetalhesVenda'

interface ModalPerfilClienteProps {
  isOpen: boolean
  onClose: () => void
  clienteId: number | null
}

interface ClienteDetalhes {
  id: number
  nome: string
  cpf: string
  telefone: string
  email: string
  dataNascimento: string
  genero: string
  limiteFiado: number
}

interface Endereco {
  id: number
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  titulo: string
}

interface InfoFinanceira {
  limiteFiado: number
  pontos: number
  saldoCredito: number
}

interface HistoricoVenda {
  id: number
  dataVenda: string
  totalVenda: number
  status: string
}

interface Pendencia {
  id: number
  descricao: string
  valor: number
  valorPago?: number
  dataVencimento: string | null
}

const initialEnderecoForm = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  titulo: ''
}

export function ModalPerfilCliente({ isOpen, onClose, clienteId }: ModalPerfilClienteProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'dados' | 'financeiro' | 'historico'>('dados')
  const [cliente, setCliente] = useState<ClienteDetalhes | null>(null)
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [infoFinanceira, setInfoFinanceira] = useState<InfoFinanceira | null>(null)
  const [historico, setHistorico] = useState<HistoricoVenda[]>([])
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [extrato, setExtrato] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Form para novo endereço
  const [showEnderecoForm, setShowEnderecoForm] = useState(false)
  const [enderecoForm, setEnderecoForm] = useState(initialEnderecoForm)
  const [isAddingEndereco, setIsAddingEndereco] = useState(false)

  // Modal de recebimento
  const [showRecebimentoModal, setShowRecebimentoModal] = useState(false)
  const [pendenciaSelecionada, setPendenciaSelecionada] = useState<Pendencia | null>(null)

  // Modal de pagamento geral
  const [showPagamentoGeralModal, setShowPagamentoGeralModal] = useState(false)

  // Modal de detalhes da venda
  const [showDetalhesVendaModal, setShowDetalhesVendaModal] = useState(false)
  const [vendaSelecionadaId, setVendaSelecionadaId] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && clienteId) {
      setActiveTab('dados')
      fetchClienteData()
    }
  }, [isOpen, clienteId])

  const fetchClienteData = async () => {
    if (!clienteId) return
    setIsLoading(true)
    
    try {
      // Buscar dados do cliente
      const resCliente = await fetch(`/api/clientes/${clienteId}`)
      if (resCliente.ok) {
        setCliente(await resCliente.json())
      }

      // Buscar endereços
      const resEnderecos = await fetch(`/api/clientes/${clienteId}/enderecos`)
      if (resEnderecos.ok) {
        setEnderecos(await resEnderecos.json())
      }

      // Buscar info financeira
      const resFinanceiro = await fetch(`/api/clientes/${clienteId}/info-financeira`)
      if (resFinanceiro.ok) {
        setInfoFinanceira(await resFinanceiro.json())
      }

      // Buscar histórico de compras
      const resHistorico = await fetch(`/api/clientes/${clienteId}/historico-compras?limite=5`)
      if (resHistorico.ok) {
        setHistorico(await resHistorico.json())
      }

      // Buscar pendências (fiado)
      const resPendencias = await fetch(`/api/clientes/${clienteId}/pendencias`)
      if (resPendencias.ok) {
        setPendencias(await resPendencias.json())
      }

      // Buscar extrato (timeline)
      const resExtrato = await fetch(`/api/clientes/${clienteId}/extrato`)
      if (resExtrato.ok) {
        setExtrato(await resExtrato.json())
      }

    } catch (e) {
      console.error('Erro ao buscar dados do cliente:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEndereco = async () => {
    if (!clienteId || !enderecoForm.logradouro) {
      toast({ title: "Erro", description: "Preencha o logradouro", variant: "destructive" })
      return
    }

    setIsAddingEndereco(true)
    try {
      const response = await fetch(`/api/clientes/${clienteId}/enderecos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enderecoForm)
      })

      if (response.ok) {
        const novoEndereco = await response.json()
        setEnderecos(prev => [...prev, novoEndereco])
        setEnderecoForm(initialEnderecoForm)
        setShowEnderecoForm(false)
        toast({ title: "Sucesso", description: "Endereço adicionado!" })
      } else {
        toast({ title: "Erro", description: "Falha ao adicionar endereço", variant: "destructive" })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Erro", description: "Erro de conexão", variant: "destructive" })
    } finally {
      setIsAddingEndereco(false)
    }
  }

  const handleDeleteEndereco = async (enderecoId: number) => {
    if (!clienteId) return

    try {
      const response = await fetch(`/api/clientes/${clienteId}/enderecos/${enderecoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEnderecos(prev => prev.filter(e => e.id !== enderecoId))
        toast({ title: "Sucesso", description: "Endereço removido!" })
      } else {
        toast({ title: "Erro", description: "Falha ao remover endereço", variant: "destructive" })
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Buscar CEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setEnderecoForm(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado
        }))
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'dados', label: 'Dados', icon: User },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    { id: 'historico', label: 'Histórico', icon: ShoppingBag },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header - Green to match table headers */}
        <div className="bg-emerald-500 text-white p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {cliente?.nome || 'Carregando...'}
            </h2>
            {cliente?.cpf && (
              <p className="text-sm text-white/80 mt-1">CPF: {cliente.cpf}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Aba Dados */}
              {activeTab === 'dados' && cliente && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nome</label>
                      <p className="text-gray-800 font-medium">{cliente.nome}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CPF</label>
                      <p className="text-gray-800">{cliente.cpf || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Data de Nascimento</label>
                      <p className="text-gray-800">
                        {cliente.dataNascimento 
                          ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Gênero</label>
                      <p className="text-gray-800">{cliente.genero || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Telefone</label>
                      <p className="text-gray-800">{cliente.telefone || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">E-mail</label>
                      <p className="text-gray-800">{cliente.email || '—'}</p>
                    </div>
                  </div>

                  {/* Seção de Endereços */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin size={16} />
                        Endereços
                      </h3>
                      <button
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                        onClick={() => setShowEnderecoForm(!showEnderecoForm)}
                      >
                        <Plus size={16} />
                        Adicionar Endereço
                      </button>
                    </div>

                    {/* Form de novo endereço */}
                    {showEnderecoForm && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-8">
                            <input
                              type="text"
                              placeholder="Título (ex: Casa)"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.titulo}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, titulo: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="CEP"
                              maxLength={9}
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.cep}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2')
                                setEnderecoForm(prev => ({ ...prev, cep: v }))
                                if (v.replace(/\D/g, '').length === 8) buscarCep(v)
                              }}
                            />
                          </div>
                          <div className="col-span-10">
                            <input
                              type="text"
                              placeholder="Logradouro"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.logradouro}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, logradouro: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Número"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.numero}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, numero: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-6">
                            <input
                              type="text"
                              placeholder="Bairro"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.bairro}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, bairro: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Cidade"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.cidade}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, cidade: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="UF"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.estado}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, estado: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-12">
                            <input
                              type="text"
                              placeholder="Complemento (Apto, Bloco, etc.)"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.complemento}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, complemento: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                            onClick={() => { setShowEnderecoForm(false); setEnderecoForm(initialEnderecoForm) }}
                          >
                            Cancelar
                          </button>
                          <button
                            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                            onClick={handleAddEndereco}
                            disabled={isAddingEndereco}
                          >
                            {isAddingEndereco ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista de endereços */}
                    {enderecos.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Nenhum endereço cadastrado</p>
                    ) : (
                      <div className="space-y-3">
                        {enderecos.map((end) => (
                          <div key={end.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {end.titulo || 'Endereço'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {end.logradouro}, {end.numero}
                                {end.complemento && ` - ${end.complemento}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {end.bairro} - {end.cidade}/{end.estado} {end.cep && `| CEP: ${end.cep}`}
                              </p>
                            </div>
                            <button
                              className="text-red-500 hover:text-red-700 p-1"
                              onClick={() => handleDeleteEndereco(end.id)}
                              title="Remover endereço"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba Financeiro */}
              {activeTab === 'financeiro' && infoFinanceira && (
                <div className="space-y-6">
                  {/* Grid de Cards de Resumo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Total a Receber */}
                    <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={48} className="text-red-500" />
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <DollarSign size={18} className="text-red-500" />
                        <span className="text-sm font-semibold">Total a Receber</span>
                      </div>
                      <div className="relative z-10">
                        <p className={`text-2xl font-bold ${
                          pendencias.reduce((acc, p) => acc + (p.valor - (p.valorPago || 0)), 0) > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            pendencias.reduce((acc, p) => acc + (p.valor - (p.valorPago || 0)), 0)
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                           {pendencias.length > 0
                             ? `${pendencias.length} lançamentos pendentes`
                             : 'Nenhuma pendência'}
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Crédito Disponível */}
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={48} className="text-blue-500" />
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                         <CreditCard size={18} className="text-blue-500" />
                         <span className="text-sm font-semibold">Crédito Disponível</span>
                      </div>
                      <div className="relative z-10">
                        <p className="text-2xl font-bold text-blue-600">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(infoFinanceira.saldoCredito)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                           <AlertCircle size={10} />
                           Pode ser usado para abater
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Pontos */}
                    <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={48} className="text-purple-500" />
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Trophy size={18} className="text-purple-500" />
                        <span className="text-sm font-semibold">Pontos Acumulados</span>
                      </div>
                      <div className="relative z-10">
                        <p className="text-2xl font-bold text-purple-600">
                          {infoFinanceira.pontos} <span className="text-base font-normal text-purple-400">Pts</span>
                        </p>
                        <p className="text-xs text-purple-400 mt-1 font-medium bg-purple-50 inline-block px-2 py-0.5 rounded">
                           Equivale a {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(infoFinanceira.pontos * 0.05)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Ação */}
                  <div className="flex justify-end">
                    <button
                      className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white text-base font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2"
                      onClick={() => setShowPagamentoGeralModal(true)}
                    >
                      <DollarSign size={20} />
                      Inserir Pagamento
                    </button>
                  </div>

                  {/* Extrato / Timeline */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag size={20} />
                        Extrato da Conta
                     </h3>

                     {isLoading ? (
                        <div className="text-center py-8 text-gray-400">Carregando extrato...</div>
                     ) : extrato.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-500 text-lg">Nenhuma movimentação registrada</p>
                        </div>
                     ) : (
                        <div className="relative border-l-2 border-gray-200 ml-4 pl-8 space-y-8 py-2">
                           {extrato.map((item, idx) => (
                             <div key={item.id} className="relative group">
                               {/* Bolinha da timeline */}
                               <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                                  item.tipo === 'PAGAMENTO' ? 'bg-emerald-500' : 'bg-red-500'
                               }`} />
                               
                               <div 
                                 className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                                   item.tipo === 'PAGAMENTO' 
                                     ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200' 
                                     : 'bg-white border-gray-100 hover:border-red-100 hover:shadow-sm cursor-pointer'
                                 }`}
                                 onClick={() => {
                                    if (item.tipo === 'VENDA' && item.origemId) {
                                      setVendaSelecionadaId(item.origemId)
                                      setShowDetalhesVendaModal(true)
                                    }
                                 }}
                               >
                                  <div className="mb-2 sm:mb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                                        item.tipo === 'PAGAMENTO' 
                                          ? 'bg-emerald-100 text-emerald-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {item.tipo === 'VENDA' ? `VENDA #${item.origemId}` : 'PAGAMENTO'}
                                      </span>
                                      <span className="text-xs text-gray-400 font-medium">
                                        {new Date(item.data).toLocaleDateString('pt-BR')} • {new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    </div>
                                    <p className="text-gray-800 font-medium">
                                      {item.descricao}
                                    </p>
                                    {item.tipo === 'PAGAMENTO' && item.formaPagamento && (
                                       <p className="text-xs text-emerald-600 mt-1">
                                          via {item.formaPagamento}
                                       </p>
                                    )}
                                  </div>

                                  <div className="text-right">
                                    <p className={`text-lg font-bold ${
                                      item.tipo === 'PAGAMENTO' ? 'text-emerald-600' : 'text-red-500'
                                    }`}>
                                      {item.tipo === 'PAGAMENTO' ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                    </p>
                                    {item.status && item.status !== 'PAGO' && item.tipo === 'VENDA' && (
                                       <span className="text-xs text-red-400 font-medium">Pendente</span>
                                    )}
                                  </div>
                               </div>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Info Adicional */}
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Como funciona o saldo?</p>
                      <p className="opacity-90">
                        O sistema abate os pagamentos automaticamente das dívidas mais antigas (FIFO).
                        Todo pagamento realizado reduz o Saldo Devedor Total.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Histórico */}
              {activeTab === 'historico' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Últimas Compras</h3>
                  
                  {historico.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Nenhuma compra realizada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historico.map((venda) => (
                        <div 
                          key={venda.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setVendaSelecionadaId(venda.id)
                            setShowDetalhesVendaModal(true)
                          }}
                        >
                          <div>
                            <p className="font-medium text-gray-800">Venda #{venda.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(venda.dataVenda).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(venda.totalVenda)}
                            </p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              venda.status === 'CONCLUIDA' ? 'bg-green-100 text-green-700' : 
                              venda.status === 'CANCELADA' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {venda.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Recebimento */}
      <ModalRecebimento
        isOpen={showRecebimentoModal}
        onClose={() => {
          setShowRecebimentoModal(false)
          setPendenciaSelecionada(null)
        }}
        onSuccess={() => {
          fetchClienteData() // Recarrega tudo após recebimento
          toast({ 
            title: "Sucesso", 
            description: "Dívida quitada com sucesso!",
            variant: "default"
          })
        }}
        pendencia={pendenciaSelecionada}
      />

      {/* Modal de Pagamento Geral */}
      <ModalPagamentoGeral
        isOpen={showPagamentoGeralModal}
        onClose={() => setShowPagamentoGeralModal(false)}
        onSuccess={() => fetchClienteData()}
        clienteId={clienteId}
        totalDevido={pendencias.reduce((acc, p) => acc + (p.valor - (p.valorPago || 0)), 0)}
      />

      {/* Modal de Detalhes da Venda */}
      <ModalDetalhesVenda
        isOpen={showDetalhesVendaModal}
        onClose={() => {
          setShowDetalhesVendaModal(false)
          setVendaSelecionadaId(null)
        }}
        vendaId={vendaSelecionadaId}
      />
    </div>
  )
}
