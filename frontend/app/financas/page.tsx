"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { 
  Search, Pencil, Trash2, FilterX, Check, 
  TrendingUp, TrendingDown, Wallet, RefreshCw,
  ArrowUpCircle, ArrowDownCircle, Calendar, Tag, DollarSign
} from "lucide-react"
import { Pagination } from "@/components/Pagination"
import { ModalLancamento } from "./components/modal-lancamento"
import { ModalCategoria } from "./components/modal-categoria"
import { ModalPagamento } from "./components/modal-pagamento"
import "./financas.css"

export default function FinancasPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("lancamentos")
  const [isLoading, setIsLoading] = useState(false)
  
  // -- Data State --
  const [lancamentosList, setLancamentosList] = useState<any[]>([])
  const [categoriasList, setCategoriasList] = useState<any[]>([])
  
  // -- Pagination State --
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // -- Filters State --
  const [filterTipo, setFilterTipo] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("vencimento-asc")

  // -- Modal States --
  const [showLancamentoModal, setShowLancamentoModal] = useState(false)
  const [lancamentoToEdit, setLancamentoToEdit] = useState<any | null>(null)
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [categoriaToEdit, setCategoriaToEdit] = useState<any | null>(null)
  
  // -- Delete States --
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)
  const [deleteType, setDeleteType] = useState<"lancamento" | "categoria">("lancamento")
  const [isDeleting, setIsDeleting] = useState(false)

  // -- Payment Modal State --
  const [showPagamentoModal, setShowPagamentoModal] = useState(false)
  const [lancamentoToPay, setLancamentoToPay] = useState<any | null>(null)

  useEffect(() => {
    fetchLancamentos()
    fetchCategorias()
  }, [])

  const fetchLancamentos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/financeiro')
      if (response.ok) {
        setLancamentosList(await response.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/financeiro/categorias')
      if (response.ok) {
        setCategoriasList(await response.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate Summary
  const calcularResumo = () => {
    const pendentes = lancamentosList.filter(l => l.status === 'PENDENTE')
    // Usar saldo restante (valor - valorPago) ao invés do valor total
    const receitas = pendentes.filter(l => l.tipo === 'RECEITA').reduce((acc, l) => {
      const saldo = parseFloat(l.valor) - parseFloat(l.valorPago || 0)
      return acc + saldo
    }, 0)
    const despesas = pendentes.filter(l => l.tipo === 'DESPESA').reduce((acc, l) => {
      const saldo = parseFloat(l.valor) - parseFloat(l.valorPago || 0)
      return acc + saldo
    }, 0)
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      totalPendentes: pendentes.length
    }
  }

  const resumo = calcularResumo()

  // Filter and Sort Logic
  const getFilteredItems = () => {
    let items = [...lancamentosList]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(l => l.descricao?.toLowerCase().includes(term))
    }
    
    if (filterTipo) {
      items = items.filter(l => l.tipo === filterTipo)
    }
    
    if (filterStatus) {
      items = items.filter(l => l.status === filterStatus)
    }
    
    if (filterCategoria) {
      items = items.filter(l => String(l.idCategoria) === filterCategoria)
    }
    
    // Sort
    items.sort((a, b) => {
      switch (sortOrder) {
        case 'vencimento-asc':
          return new Date(a.dataVencimento || '9999-12-31').getTime() - new Date(b.dataVencimento || '9999-12-31').getTime()
        case 'vencimento-desc':
          return new Date(b.dataVencimento || '0000-01-01').getTime() - new Date(a.dataVencimento || '0000-01-01').getTime()
        case 'valor-asc':
          return parseFloat(a.valor) - parseFloat(b.valor)
        case 'valor-desc':
          return parseFloat(b.valor) - parseFloat(a.valor)
        default:
          return 0
      }
    })
    
    return items
  }

  const filteredCategorias = () => {
    let items = [...categoriasList]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(c => c.nome?.toLowerCase().includes(term))
    }
    return items
  }

  const currentItemsList = activeTab === 'lancamentos' ? getFilteredItems() : filteredCategorias()
  const totalPages = Math.ceil(currentItemsList.length / itemsPerPage)
  const currentDisplayItems = currentItemsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleTabs = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm("")
  }

  const clearFilters = () => {
    setFilterTipo("")
    setFilterStatus("")
    setFilterCategoria("")
    setSearchTerm("")
    setSortOrder("vencimento-asc")
    setCurrentPage(1)
  }

  const openPagamentoModal = (lancamento: any) => {
    setLancamentoToPay(lancamento)
    setShowPagamentoModal(true)
  }

  const openEditLancamento = (lancamento: any) => {
    setLancamentoToEdit(lancamento)
    setShowLancamentoModal(true)
  }

  const openDeleteLancamento = (lancamento: any) => {
    setItemToDelete(lancamento)
    setDeleteType("lancamento")
  }

  const openEditCategoria = (categoria: any) => {
    setCategoriaToEdit(categoria)
    setShowCategoriaModal(true)
  }

  const openDeleteCategoria = (categoria: any) => {
    setItemToDelete(categoria)
    setDeleteType("categoria")
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    
    try {
      const url = deleteType === "lancamento" 
        ? `/api/financeiro/${itemToDelete.id}`
        : `/api/financeiro/categorias/${itemToDelete.id}`
      
      const response = await fetch(url, { method: 'DELETE' })
      
      if (!response.ok) throw new Error('Falha ao excluir')
      
      toast({ title: "Sucesso", description: `${deleteType === 'lancamento' ? 'Lançamento' : 'Categoria'} excluído(a) com sucesso.` })
      
      if (deleteType === "lancamento") {
        fetchLancamentos()
      } else {
        fetchCategorias()
      }
      setItemToDelete(null)
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Erro ao excluir", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoriaById = (id: number) => {
    return categoriasList.find(c => c.id === id)
  }

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(typeof value === 'string' ? parseFloat(value) : value)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const isOverdue = (lancamento: any) => {
    if (lancamento.status === 'PAGO' || !lancamento.dataVencimento) return false
    return new Date(lancamento.dataVencimento) < new Date()
  }

  return (
    <div className="financas-layout">
      <Sidebar />
      <div className="financas-content">
        <div className="financas-header">
          <h1>Finanças</h1>
          <div className="search-bar w-full max-w-md">
            <div className="relative w-full">
              <input 
                type="text" 
                className="w-full pl-3 pr-10 py-2 border rounded-md"
                placeholder={activeTab === 'lancamentos' ? "Buscar lançamento..." : "Buscar categoria..."} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {activeTab === 'lancamentos' && (
          <div className="summary-cards">
            <div className="summary-card">
              <h4>A Receber (Pendente)</h4>
              <div className="value receita">{formatCurrency(resumo.receitas)}</div>
            </div>
            <div className="summary-card">
              <h4>A Pagar (Pendente)</h4>
              <div className="value despesa">{formatCurrency(resumo.despesas)}</div>
            </div>
            <div className="summary-card">
              <h4>Saldo Projetado</h4>
              <div className={`value ${resumo.saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo'}`}>
                {formatCurrency(resumo.saldo)}
              </div>
            </div>
            <div className="summary-card">
              <h4>Lançamentos Pendentes</h4>
              <div className="value" style={{color: '#6b7280'}}>{resumo.totalPendentes}</div>
            </div>
          </div>
        )}

        <div className="financas-main">
          <aside className="filters-panel">
            <h3>Filtros</h3>
            
            {activeTab === 'lancamentos' && (
              <>
                <div className="filter-group">
                  <label>Ordenar por</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="vencimento-asc">Vencimento (Próximos)</option>
                    <option value="vencimento-desc">Vencimento (Distantes)</option>
                    <option value="valor-desc">Maior Valor</option>
                    <option value="valor-asc">Menor Valor</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Tipo</label>
                  <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="RECEITA">Receitas</option>
                    <option value="DESPESA">Despesas</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="PAGO">Pagos</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Categoria</label>
                  <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                    <option value="">Todas</option>
                    {categoriasList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <button 
              className="btn-filter flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600"
              onClick={clearFilters}
            >
              <FilterX size={18} />
              Limpar Filtros
            </button>
          </aside>

          <div className="table-section">
            <div className="flex justify-between items-center mb-6">
              <div className="tabs-container !mb-0">
                <button 
                  className={`tab ${activeTab === 'lancamentos' ? 'active' : ''}`}
                  onClick={() => handleTabs('lancamentos')}
                >
                  Lançamentos
                </button>
                <button 
                  className={`tab ${activeTab === 'categorias' ? 'active' : ''}`}
                  onClick={() => handleTabs('categorias')}
                >
                  Categorias
                </button>
              </div>

              {activeTab === 'lancamentos' && (
                <button className="btn-cadastrar" onClick={() => {
                  setLancamentoToEdit(null)
                  setShowLancamentoModal(true)
                }}>
                  Novo Lançamento +
                </button>
              )}
              {activeTab === 'categorias' && (
                <button className="btn-cadastrar" onClick={() => {
                  setCategoriaToEdit(null)
                  setShowCategoriaModal(true)
                }}>
                  Nova Categoria +
                </button>
              )}
            </div>

            <div className="table-wrapper">
              {activeTab === 'lancamentos' && (
                <table className="financas-table">
                  <thead>
                    <tr>
                      <th className="text-center whitespace-nowrap">Ações</th>
                      <th className="whitespace-nowrap">Categoria</th>
                      <th className="whitespace-nowrap">Descrição</th>
                      <th className="whitespace-nowrap">Valor</th>
                      <th className="whitespace-nowrap">Tipo</th>
                      <th className="whitespace-nowrap">Status</th>
                      <th className="whitespace-nowrap">Vencimento</th>
                      <th className="whitespace-nowrap">Recorrência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="text-center py-8">Carregando...</td></tr>
                    ) : currentDisplayItems.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8">Nenhum lançamento encontrado</td></tr>
                    ) : currentDisplayItems.map((lancamento: any) => {
                      const categoria = getCategoriaById(lancamento.idCategoria)
                      const vencido = isOverdue(lancamento)
                      
                      return (
                        <tr key={lancamento.id} className={vencido ? 'bg-red-50' : ''}>
                          <td>
                            <div className="flex justify-center items-center gap-1">
                              {lancamento.status === 'PENDENTE' && (
                                <button 
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                  title="Registrar Pagamento"
                                  onClick={() => openPagamentoModal(lancamento)}
                                >
                                  <DollarSign size={16} />
                                </button>
                              )}
                              <button 
                                className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                                title="Editar"
                                onClick={() => openEditLancamento(lancamento)}
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Excluir"
                                onClick={() => openDeleteLancamento(lancamento)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                          <td>
                            {categoria ? (
                              <span className="category-tag">
                                <span 
                                  className="category-color" 
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.nome}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap font-medium">
                            {lancamento.descricao}
                          </td>
                          <td className={`whitespace-nowrap font-semibold ${
                            lancamento.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {lancamento.tipo === 'RECEITA' ? '+' : '-'} {formatCurrency(lancamento.valor)}
                          </td>
                          <td>
                            <span className={`type-badge ${lancamento.tipo.toLowerCase()}`}>
                              {lancamento.tipo === 'RECEITA' ? (
                                <><ArrowUpCircle size={12} /> Receita</>
                              ) : (
                                <><ArrowDownCircle size={12} /> Despesa</>
                              )}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${lancamento.status.toLowerCase()}`}>
                              {lancamento.status}
                            </span>
                          </td>
                          <td className={`whitespace-nowrap ${vencido ? 'text-red-600 font-semibold' : ''}`}>
                            {formatDate(lancamento.dataVencimento)}
                            {vencido && <span className="ml-1 text-xs">(Vencido)</span>}
                          </td>
                          <td>
                            {lancamento.frequencia && lancamento.frequencia !== 'NENHUMA' ? (
                              <span className="recurrence-badge">
                                <RefreshCw size={10} />
                                {lancamento.frequencia}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              
              {activeTab === 'categorias' && (
                <table className="financas-table">
                  <thead>
                    <tr>
                      <th className="text-center whitespace-nowrap">Ações</th>
                      <th className="whitespace-nowrap">Cor</th>
                      <th className="whitespace-nowrap">Nome</th>
                      <th className="whitespace-nowrap">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={4} className="text-center py-8">Carregando...</td></tr>
                    ) : currentDisplayItems.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8">Nenhuma categoria encontrada</td></tr>
                    ) : currentDisplayItems.map((categoria: any) => (
                      <tr key={categoria.id}>
                        <td>
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                              title="Editar"
                              onClick={() => openEditCategoria(categoria)}
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir"
                              onClick={() => openDeleteCategoria(categoria)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="w-6 h-6 rounded-full inline-block border"
                            style={{ backgroundColor: categoria.cor }}
                          />
                        </td>
                        <td className="whitespace-nowrap font-medium">{categoria.nome}</td>
                        <td>
                          <span className={`type-badge ${categoria.tipo.toLowerCase()}`}>
                            {categoria.tipo === 'RECEITA' ? (
                              <><ArrowUpCircle size={12} /> Receita</>
                            ) : (
                              <><ArrowDownCircle size={12} /> Despesa</>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

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

      <ModalLancamento
        isOpen={showLancamentoModal}
        onClose={() => setShowLancamentoModal(false)}
        onSuccess={() => {
          fetchLancamentos()
          setShowLancamentoModal(false)
        }}
        categorias={categoriasList}
        lancamentoParaEditar={lancamentoToEdit}
      />

      <ModalCategoria
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSuccess={() => {
          fetchCategorias()
          setShowCategoriaModal(false)
        }}
        categoriaParaEditar={categoriaToEdit}
      />

      <ModalPagamento
        isOpen={showPagamentoModal}
        onClose={() => setShowPagamentoModal(false)}
        onSuccess={() => {
          fetchLancamentos()
          setShowPagamentoModal(false)
        }}
        lancamento={lancamentoToPay}
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay" style={{zIndex: 50}}>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-2">
              Excluir {deleteType === 'lancamento' ? 'Lançamento' : 'Categoria'}
            </h3>
            <p className="mb-4">
              Tem certeza que deseja excluir{' '}
              <b>{deleteType === 'lancamento' ? itemToDelete.descricao : itemToDelete.nome}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" 
                onClick={() => setItemToDelete(null)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" 
                onClick={handleConfirmDelete} 
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
