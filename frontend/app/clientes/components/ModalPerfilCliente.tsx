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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {cliente?.nome || 'Carregando...'}
            </h2>
            {cliente?.cpf && (
              <p className="text-sm text-gray-500 mt-1">CPF: {cliente.cpf}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                        <div className="grid grid-cols-6 gap-3">
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Título (ex: Casa)"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.titulo}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, titulo: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
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
                          <div className="col-span-4">
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
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Bairro"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.bairro}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, bairro: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Cidade"
                              className="w-full p-2 text-sm border border-gray-300 rounded"
                              value={enderecoForm.cidade}
                              onChange={(e) => setEnderecoForm(prev => ({ ...prev, cidade: e.target.value }))}
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
                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">Total Devido</span>
                      </div>
                      <p className="text-2xl font-bold text-red-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          pendencias.reduce((acc, p) => acc + (p.valor - (p.valorPago || 0)), 0)
                        )}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CreditCard size={18} />
                        <span className="text-sm font-medium">Saldo Crédito</span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(infoFinanceira.saldoCredito)}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <Trophy size={18} />
                        <span className="text-sm font-medium">Pontos</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">
                        {infoFinanceira.pontos} pts
                      </p>
                    </div>
                  </div>

                  {/* Pendências */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign size={16} />
                        Dívidas Pendentes
                      </h3>
                      {pendencias.length > 0 && (
                        <button
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center gap-2"
                          onClick={() => setShowPagamentoGeralModal(true)}
                        >
                          <DollarSign size={16} />
                          Pagar Todas ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            pendencias.reduce((acc, p) => acc + (p.valor - (p.valorPago || 0)), 0)
                          )})
                        </button>
                      )}
                    </div>

                    {pendencias.length === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <p className="text-green-700 font-medium text-lg">🎉 Nenhuma dívida pendente!</p>
                        <p className="text-green-600 text-sm mt-1">Cliente está em dia com os pagamentos</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-3 py-2 text-gray-600 font-medium">Descrição</th>
                              <th className="text-left px-3 py-2 text-gray-600 font-medium">Vencimento</th>
                              <th className="text-right px-3 py-2 text-gray-600 font-medium">Valor</th>
                              <th className="text-center px-3 py-2 text-gray-600 font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pendencias.map((pendencia) => {
                              const vencido = pendencia.dataVencimento && new Date(pendencia.dataVencimento) < new Date()
                              
                              return (
                                <tr key={pendencia.id} className={vencido ? 'bg-red-50' : ''}>
                                  <td className="px-3 py-3 text-gray-800">{pendencia.descricao}</td>
                                  <td className={`px-3 py-3 ${vencido ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                    {pendencia.dataVencimento 
                                      ? new Date(pendencia.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')
                                      : '—'
                                    }
                                    {vencido && <span className="ml-1 text-xs">(Vencido)</span>}
                                  </td>
                                  <td className="px-3 py-3 text-right font-bold text-red-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendencia.valor)}
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <button
                                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 mx-auto"
                                      onClick={() => {
                                        setPendenciaSelecionada(pendencia)
                                        setShowRecebimentoModal(true)
                                      }}
                                    >
                                      <DollarSign size={14} />
                                      Receber
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Info Adicional */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-500" />
                      Os pontos podem ser resgatados como desconto em compras (R$ 0,05 por ponto).
                    </p>
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
