'use client'

import { Sidebar } from '@/components/sidebar'
import { Search, Eye, Edit, FilterX, Plus, Phone, Cake, Trophy, AlertCircle, CreditCard, CheckCircle, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { ModalPerfilCliente } from './components/ModalPerfilCliente'
import { ModalCadastroCliente } from './components/ModalCadastroCliente'
import './clientes.css'

interface ClienteEnriquecido {
  id: number
  nome: string
  cpf: string
  telefone: string
  email: string
  dataNascimento: string
  limiteFiado: number
  saldoPontos: number
  saldoCredito: number
  temPendencia: boolean
  cidade: string
  bairro: string
  aniversarianteDoMes: boolean
}

export default function ClientesPage() {
  const { toast } = useToast()
  
  // -- Data State --
  const [clientes, setClientes] = useState<ClienteEnriquecido[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // -- Pagination State --
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // -- Filters State --
  const [searchTerm, setSearchTerm] = useState('')
  const [filterInadimplente, setFilterInadimplente] = useState(false)
  const [filterComCredito, setFilterComCredito] = useState(false)
  const [filterAniversariantes, setFilterAniversariantes] = useState(false)
  
  // -- Modal State --
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [showCadastroModal, setShowCadastroModal] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null)
  const [editingCliente, setEditingCliente] = useState<ClienteEnriquecido | null>(null)

  // -- Delete Confirmation State --
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<ClienteEnriquecido | null>(null)

  useEffect(() => {
    fetchClientes()
  }, [])

  // Debounce for fetch with filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, filterInadimplente, filterComCredito, filterAniversariantes])

  const fetchClientes = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterInadimplente) params.append('inadimplente', 'true')
      if (filterComCredito) params.append('comCredito', 'true')
      if (filterAniversariantes) params.append('aniversariantes', 'true')

      const response = await fetch(`/api/clientes?${params.toString()}`)
      if (response.ok) {
        setClientes(await response.json())
      } else {
        console.error("Erro ao buscar clientes")
        toast({ title: "Erro", description: "Falha ao carregar clientes", variant: "destructive" })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterInadimplente(false)
    setFilterComCredito(false)
    setFilterAniversariantes(false)
    setCurrentPage(1)
  }

  const handleOpenPerfil = (id: number) => {
    setSelectedClienteId(id)
    setShowPerfilModal(true)
  }

  const handleOpenEditar = (cliente: ClienteEnriquecido) => {
    setEditingCliente(cliente)
    setShowCadastroModal(true)
  }

  const handleOpenNovo = () => {
    setEditingCliente(null)
    setShowCadastroModal(true)
  }

  const handleSaveSuccess = () => {
    setShowCadastroModal(false)
    setEditingCliente(null)
    fetchClientes()
    toast({ title: "Sucesso", description: "Cliente salvo com sucesso!" })
  }

  const handleDeleteClick = (cliente: ClienteEnriquecido) => {
    setClienteToDelete(cliente)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return

    try {
      const response = await fetch(`/api/clientes/${clienteToDelete.id}`, { method: 'DELETE' })
      
      if (response.ok) {
        toast({ title: "Sucesso", description: "Cliente excluído com sucesso!" })
        fetchClientes()
      } else {
        const err = await response.json()
        toast({ 
          title: "Erro", 
          description: err.error || "Não é possível excluir cliente com histórico financeiro.", 
          variant: "destructive" 
        })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Erro", description: "Erro de conexão", variant: "destructive" })
    } finally {
      setShowDeleteConfirm(false)
      setClienteToDelete(null)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(clientes.length / itemsPerPage)
  const currentDisplayItems = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helper: Format phone for WhatsApp link
  const getWhatsAppLink = (phone: string) => {
    if (!phone) return '#'
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/55${cleanPhone}`
  }

  // Helper: Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  // Helper: Render status badge
  const renderStatusBadge = (cliente: ClienteEnriquecido) => {
    if (cliente.temPendencia) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
          <AlertCircle size={12} />
          INADIMPLENTE
        </span>
      )
    }
    if (cliente.saldoCredito > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
          <CreditCard size={12} />
          CRÉDITO: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.saldoCredito)}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        <CheckCircle size={12} />
        EM DIA
      </span>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          
          <div className="flex gap-4 items-center">
            <div className="relative w-72">
              <input 
                type="text" 
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por Nome ou CPF" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={handleOpenNovo}
            >
              <Plus size={18} />
              Novo Cliente
            </Button>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar de Filtros */}
          <aside className="w-[280px] bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Filtros</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Situação Financeira</label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    checked={filterInadimplente}
                    onChange={(e) => setFilterInadimplente(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Clientes Inadimplentes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filterComCredito}
                    onChange={(e) => setFilterComCredito(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Com Crédito em Loja</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Datas Especiais</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  checked={filterAniversariantes}
                  onChange={(e) => setFilterAniversariantes(e.target.checked)}
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Cake size={14} className="text-pink-500" />
                  Aniversariantes do Mês
                </span>
              </label>
            </div>
             
            <button 
              className="w-full py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              onClick={clearFilters}
            >
              <FilterX size={18} />
              Limpar Filtros
            </button>
          </aside>

          {/* Tabela */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-500 text-white">
                  <tr>
                    <th className="p-4 text-center font-bold">Ações</th>
                    <th className="p-4 text-left font-bold">Cliente</th>
                    <th className="p-4 text-left font-bold">Contato</th>
                    <th className="p-4 text-center font-bold">Nascimento</th>
                    <th className="p-4 text-center font-bold">Fidelidade</th>
                    <th className="p-4 text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">Carregando...</td></tr>
                  ) : currentDisplayItems.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum cliente encontrado</td></tr>
                  ) : currentDisplayItems.map((cliente) => (
                    <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Ações */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button 
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                            title="Ver Perfil"
                            onClick={() => handleOpenPerfil(cliente.id)}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                            title="Editar"
                            onClick={() => handleOpenEditar(cliente)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir"
                            onClick={() => handleDeleteClick(cliente)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                      {/* Cliente */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-gray-800 flex items-center gap-1">
                              {cliente.nome}
                              {cliente.aniversarianteDoMes && (
                                <Cake size={14} className="text-pink-500" title="Aniversariante do mês!" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{cliente.cpf || '—'}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Contato */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {cliente.telefone && (
                            <a 
                              href={getWhatsAppLink(cliente.telefone)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-gray-700 hover:text-green-600 flex items-center gap-1"
                            >
                              <Phone size={14} className="text-green-500" />
                              {cliente.telefone}
                            </a>
                          )}
                          <span className="text-sm text-gray-500">{cliente.email || '—'}</span>
                        </div>
                      </td>
                      
                      {/* Nascimento */}
                      <td className="p-4 text-center">
                        <span className="text-sm text-gray-700">
                          {formatDate(cliente.dataNascimento)}
                        </span>
                      </td>
                      
                      {/* Fidelidade */}
                      <td className="p-4 text-center">
                        {cliente.saldoPontos > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                            <Trophy size={12} />
                            {cliente.saldoPontos} pts
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      
                      {/* Status */}
                      <td className="p-4 text-center">
                        {renderStatusBadge(cliente)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && clienteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o cliente <strong>{clienteToDelete.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteConfirm(false); setClienteToDelete(null); }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      <ModalPerfilCliente
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        clienteId={selectedClienteId}
      />

      {/* Modal de Cadastro/Edição */}
      <ModalCadastroCliente
        isOpen={showCadastroModal}
        onClose={() => { setShowCadastroModal(false); setEditingCliente(null); }}
        cliente={editingCliente}
        onSuccess={handleSaveSuccess}
      />
    </div>
  )
}
