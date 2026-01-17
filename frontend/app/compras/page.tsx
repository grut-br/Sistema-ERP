"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Search, Pencil, Trash2, Eye, FilterX, Check, ChevronsUpDown } from "lucide-react"
import { Pagination } from "@/components/Pagination"
import { ModalFornecedor } from "./components/modal-fornecedor"
import { ModalNovaEntrada } from "./components/modal-nova-entrada"
import { ModalDetalhesCompra } from "./components/modal-detalhes-compra"
import { ModalCadastroProduto } from "../produtos/components/modal-cadastro-produto"
import "./compras.css"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function ComprasPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("entradas") // 'entradas' | 'fornecedores'
  const [isLoading, setIsLoading] = useState(false)
  
  // -- Data State --
  const [fornecedoresList, setFornecedoresList] = useState<any[]>([])
  const [produtosList, setProdutosList] = useState<any[]>([])
  const [comprasList, setComprasList] = useState<any[]>([])
  
  // -- Pagination State --
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // -- Filters State (Entradas) --
  const [selectedFornecedorFilter, setSelectedFornecedorFilter] = useState("") 
  const [selectedProductFilter, setSelectedProductFilter] = useState("") // From Top Bar Combobox
  const [filterNf, setFilterNf] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [sortOrderCompra, setSortOrderCompra] = useState("DESC")

  // -- UI State --
  const [comboboxOpen, setComboboxOpen] = useState(false) // For Top Bar
  const [searchTermFornecedor, setSearchTermFornecedor] = useState("") // For Fornecedores Tab Search

  // -- Modal States --
  const [showNewEntradaModal, setShowNewEntradaModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedCompraId, setSelectedCompraId] = useState<number | null>(null)
  const [showNovoProdutoModal, setShowNovoProdutoModal] = useState(false)

  const [showNewFornecedorModal, setShowNewFornecedorModal] = useState(false)
  const [fornecedorToEdit, setFornecedorToEdit] = useState<any | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<any | null>(null)
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false)

  // -- Compra Edit/Delete State --
  const [compraToEdit, setCompraToEdit] = useState<any | null>(null)
  const [compraToDelete, setCompraToDelete] = useState<any | null>(null)
  const [isDeletingCompra, setIsDeletingCompra] = useState(false)

  // -- Sorting (Fornecedores) --
  const [sortOptionFornecedor, setSortOptionFornecedor] = useState("name-asc")

  useEffect(() => {
    fetchFornecedores()
    fetchProdutos() 
  }, []) 

  // Debounce fetch when filters change
  useEffect(() => {
    if (activeTab === 'entradas') {
        const timer = setTimeout(() => {
            fetchCompras() 
        }, 500)
        return () => clearTimeout(timer)
    }
  }, [activeTab, selectedFornecedorFilter, selectedProductFilter, filterNf, dateStart, dateEnd, sortOrderCompra])

  const fetchCompras = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      // Top Bar Filter (Product ID)
      if (selectedProductFilter) params.append('idProduto', selectedProductFilter)
      
      // Sidebar Filters
      if (selectedFornecedorFilter) params.append('idFornecedor', selectedFornecedorFilter)
      if (filterNf) params.append('notaFiscal', filterNf)
      
      if (dateStart) params.append('dataInicio', dateStart)
      if (dateEnd) params.append('dataFim', dateEnd)
      
      // Sort
      params.append('sort', sortOrderCompra)

      const response = await fetch(`/api/compras?${params.toString()}`)
      if (response.ok) {
        setComprasList(await response.json())
      }
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoading(false)
    }
  }

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      if (response.ok) setFornecedoresList(await response.json())
    } catch (e) { console.error(e) }
  }

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) setProdutosList(await response.json())
    } catch (e) { console.error(e) }
  }

  // Client-Side Logic for Fornecedores Tab
  const getFilteredItems = () => {
    if (activeTab === 'fornecedores') {
        let items = [...fornecedoresList]
        if (searchTermFornecedor) {
             const lowerTerm = searchTermFornecedor.toLowerCase()
             const cleanSearch = lowerTerm.replace(/[^0-9a-z]/g, "")
             items = items.filter(f => {
                const cleanCnpj = (f.cnpj || "").replace(/[^0-9a-z]/g, "") 
                return f.nome?.toLowerCase().includes(lowerTerm) || cleanCnpj.includes(cleanSearch)
             })
        }
        items.sort((a, b) => {
            if (sortOptionFornecedor === 'id-asc') return a.id - b.id
            if (sortOptionFornecedor === 'id-desc') return b.id - a.id
            if (sortOptionFornecedor === 'name-asc') return a.nome.localeCompare(b.nome)
            if (sortOptionFornecedor === 'name-desc') return b.nome.localeCompare(a.nome)
            return 0
        })
        return items
    }
    return comprasList
  }

  const currentItemsList = getFilteredItems()
  const totalPages = Math.ceil(currentItemsList.length / itemsPerPage)

  const handleTabs = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTermFornecedor("")
  }

  const clearFilters = () => {
      setSelectedProductFilter("")
      setSortOptionFornecedor("name-asc")
      
      // Compras filters
      setSelectedFornecedorFilter("")
      setFilterNf("")
      setDateStart("")
      setDateEnd("")
      setSortOrderCompra("DESC")
      
      setCurrentPage(1)
  }

  const openEditFornecedor = (fornecedor: any) => {
    setFornecedorToEdit(fornecedor)
    setShowNewFornecedorModal(true)
  }

  const openDeleteFornecedor = (fornecedor: any) => {
    setSupplierToDelete(fornecedor)
  }

  const handleConfirmDeleteSupplier = async () => {
    if (!supplierToDelete) return
    setIsDeletingSupplier(true)
    try {
        const response = await fetch(`/api/fornecedores/${supplierToDelete.id}`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Falha ao excluir fornecedor')
        
        toast({ title: "Sucesso", description: "Fornecedor excluído com sucesso." })
        fetchFornecedores()
        setSupplierToDelete(null)
    } catch (e: any) {
        console.error(e)
        const msg = e.message.includes("produtos associados") 
            ? "Não é possível excluir fornecedor com produtos associados."
            : (e.message || "Erro ao excluir");
        toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
        setIsDeletingSupplier(false)
    }
  }

  const handleConfirmDeleteCompra = async () => {
    if (!compraToDelete) return
    setIsDeletingCompra(true)
    try {
        const response = await fetch(`/api/compras/${compraToDelete.id}`, {
            method: 'DELETE'
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Falha ao estornar compra')
        
        toast({ title: "Sucesso", description: "Compra estornada com sucesso." })
        fetchCompras()
        setCompraToDelete(null)
    } catch (e: any) {
        console.error(e)
        toast({ title: "Erro", description: e.message || "Erro ao estornar compra", variant: "destructive" })
    } finally {
        setIsDeletingCompra(false)
    }
  }

  const handleEditCompra = async (compraId: number) => {
    try {
      const response = await fetch(`/api/compras/${compraId}`)
      if (!response.ok) throw new Error('Falha ao carregar dados da compra')
      const compraCompleta = await response.json()
      setCompraToEdit(compraCompleta)
      setShowNewEntradaModal(true)
    } catch (e: any) {
      console.error(e)
      toast({ title: "Erro", description: e.message || "Erro ao carregar compra para edição", variant: "destructive" })
    }
  }

  const currentDisplayItems = currentItemsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const selectedProductName = produtosList.find(p => String(p.id) === selectedProductFilter)?.nome

  return (
    <div className="produtos-layout">
      <Sidebar />
      <div className="produtos-content">
        <div className="produtos-header">
            <h1>Compras</h1>
            <div className="search-bar w-full max-w-md">
                {activeTab === 'fornecedores' ? (
                     <div className="relative w-full">
                        <input 
                            type="text" 
                            className="w-full pl-3 pr-10 py-2 border rounded-md"
                            placeholder="Buscar Fornecedor (Nome/CNPJ)" 
                            value={searchTermFornecedor}
                            onChange={(e) => setSearchTermFornecedor(e.target.value)}
                        />
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                     </div>
                ) : (
                    /* Product Combobox for Entries */
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full justify-between h-11 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        {selectedProductFilter
                          ? selectedProductName
                          : "Filtrar por nome do produto..."}
                        <div className="flex items-center">
                            {selectedProductFilter && (
                                <div 
                                    className="mr-2 p-1 hover:bg-gray-200 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedProductFilter("")
                                    }}
                                >
                                    <Trash2 size={14} className="text-gray-500" />
                                </div>
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0 z-[50]" align="end">
                      <Command>
                        <CommandInput placeholder="Procurar produto..." />
                        <CommandList>
                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                            <CommandGroup>
                            {produtosList.map((produto) => (
                                <CommandItem
                                key={produto.id}
                                value={produto.nome}
                                onSelect={() => {
                                    setSelectedProductFilter(String(produto.id))
                                    setComboboxOpen(false)
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProductFilter === String(produto.id) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {produto.nome}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
            </div>
        </div>

        <div className="produtos-main">
            <aside className="filters-panel">
                <h3>Filtros</h3>
                
                {activeTab === 'fornecedores' && (
                    <div className="filter-group">
                        <label>Ordenar por</label>
                        <select 
                            value={sortOptionFornecedor}
                            onChange={(e) => setSortOptionFornecedor(e.target.value)}
                        >
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="id-desc">ID (Decrescente)</option>
                            <option value="id-asc">ID (Crescente)</option>
                        </select>
                    </div>
                )}
                
                 {activeTab === 'entradas' && (
                     <>
                        <div className="filter-group">
                             <label>Ordenar por Data</label>
                             <select 
                                value={sortOrderCompra}
                                onChange={(e) => setSortOrderCompra(e.target.value)}
                            >
                                <option value="DESC">Mais recentes primeiro</option>
                                <option value="ASC">Mais antigos primeiro</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Fornecedor</label>
                            <select 
                                value={selectedFornecedorFilter}
                                onChange={(e) => setSelectedFornecedorFilter(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {fornecedoresList.map(f => (
                                    <option key={f.id} value={f.id}>{f.nome}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                             <label>Número da NF</label>
                             <input 
                                type="text"
                                className="w-full p-2 border rounded text-sm mb-2"
                                placeholder="Digite o nº"
                                value={filterNf}
                                onChange={e => setFilterNf(e.target.value)}
                             />
                        </div>

                        <div className="filter-group">
                             <label>Período</label>
                             <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-8">De:</span>
                                    <input 
                                        type="date" 
                                        className="flex-1 p-2 border rounded text-sm"
                                        value={dateStart}
                                        onChange={e => setDateStart(e.target.value)}
                                        title="Data Início"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-8">Até:</span>
                                    <input 
                                        type="date" 
                                        className="flex-1 p-2 border rounded text-sm"
                                        value={dateEnd}
                                        onChange={e => setDateEnd(e.target.value)}
                                        title="Data Fim"
                                    />
                                </div>
                             </div>
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
                <div className="tabs-container">
                    <button 
                        className={`tab ${activeTab === 'entradas' ? 'active' : ''}`}
                        onClick={() => handleTabs('entradas')}
                    >
                        Entradas
                    </button>
                    <button 
                        className={`tab ${activeTab === 'fornecedores' ? 'active' : ''}`}
                        onClick={() => handleTabs('fornecedores')}
                    >
                        Fornecedores
                    </button>

                    {activeTab === 'entradas' && (
                        <button className="btn-cadastrar" onClick={() => setShowNewEntradaModal(true)}>
                            Nova Entrada +
                        </button>
                    )}
                    {activeTab === 'fornecedores' && (
                        <button className="btn-cadastrar" onClick={() => {
                            setFornecedorToEdit(null)
                            setShowNewFornecedorModal(true)
                        }}>
                            Novo Fornecedor +
                        </button>
                    )}
                </div>

                <div className="table-wrapper">
                    {activeTab === 'entradas' && (
                        <table className="produtos-table">
                            <thead>
                                <tr>
                                    <th className="text-center whitespace-nowrap">Ações</th>
                                    <th className="whitespace-nowrap">Nº</th>
                                    <th className="whitespace-nowrap">Data</th>
                                    <th className="whitespace-nowrap">Fornecedor</th>
                                    <th className="whitespace-nowrap">Nota Fiscal</th>
                                    <th className="whitespace-nowrap">Valor Total</th>
                                    <th className="whitespace-nowrap">Observações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={7} className="text-center py-8">Carregando...</td></tr>
                                ) : currentDisplayItems.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8">Nenhuma entrada encontrada</td></tr>
                                ) : currentDisplayItems.map((compra: any) => (
                                    <tr key={compra.id}>
                                        <td>
                                          <div className="flex justify-center items-center gap-2">
                                              <button 
                                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Ver Detalhes"
                                                onClick={() => {
                                                    setSelectedCompraId(compra.id)
                                                    setShowDetalhesModal(true)
                                                }}
                                              >
                                                <Eye size={18} />
                                              </button>
                                              <button 
                                                className="p-1 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                                                title="Editar"
                                                onClick={() => handleEditCompra(compra.id)}
                                              >
                                                <Pencil size={18} />
                                              </button>
                                              <button 
                                                className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Estornar"
                                                onClick={() => setCompraToDelete(compra)}
                                              >
                                                <Trash2 size={18} />
                                              </button>
                                          </div>
                                        </td>
                                        <td className="whitespace-nowrap text-center font-mono text-sm text-gray-500">{compra.id}</td>
                                        <td className="whitespace-nowrap">
                                            {compra.dataCompra ? new Date(compra.dataCompra + 'T00:00:00').toLocaleDateString('pt-BR') : "-"}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            {compra.fornecedor?.nome || "-"}
                                        </td>
                                        <td className="whitespace-nowrap">{compra.notaFiscal || "-"}</td>
                                        <td className="whitespace-nowrap">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(compra.valorTotal || 0)}
                                        </td>
                                        <td className="whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                                            {compra.observacoes || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    
                    {activeTab === 'fornecedores' && (
                       <table className="produtos-table">
                       <thead>
                         <tr>
                           <th className="text-center whitespace-nowrap">Ações</th>
                           <th className="whitespace-nowrap">ID</th>
                           <th className="whitespace-nowrap">Nome</th>
                           <th className="whitespace-nowrap">CNPJ</th>
                           <th className="whitespace-nowrap">Email</th>
                           <th className="whitespace-nowrap">Telefone</th>
                         </tr>
                       </thead>
                       <tbody>
                         {isLoading ? (
                           <tr><td colSpan={6} className="text-center py-8">Carregando...</td></tr>
                         ) : currentDisplayItems.length === 0 ? (
                           <tr><td colSpan={6} className="text-center py-8">Nenhum fornecedor encontrado</td></tr>
                         ) : currentDisplayItems.map((f: any) => (
                           <tr key={f.id}>
                             <td>
                                 <div className="flex justify-center items-center gap-2">
                                 <button 
                                   className="p-2 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                                   title="Editar"
                                   onClick={() => openEditFornecedor(f)}
                                 >
                                   <Pencil size={18} />
                                 </button>
                                 <button 
                                   className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                   title="Excluir"
                                   onClick={() => openDeleteFornecedor(f)}
                                 >
                                   <Trash2 size={18} />
                                 </button>
                               </div>
                             </td>
                             <td className="whitespace-nowrap">{f.id}</td>
                             <td className="whitespace-nowrap">{f.nome}</td>
                             <td className="whitespace-nowrap">{f.cnpj || "-"}</td>
                             <td className="whitespace-nowrap">{f.email || "-"}</td>
                             <td className="whitespace-nowrap">{f.telefone || "-"}</td>
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

      <ModalFornecedor
        isOpen={showNewFornecedorModal}
        onClose={() => setShowNewFornecedorModal(false)}
        onSuccess={() => {
            fetchFornecedores()
            setShowNewFornecedorModal(false)
        }}
        fornecedorParaEditar={fornecedorToEdit}
      />

      <ModalNovaEntrada
        isOpen={showNewEntradaModal}
        onClose={() => {
           setShowNewEntradaModal(false)
           setCompraToEdit(null)
        }}
        onSuccess={() => {
           fetchCompras()
           toast({ title: "Sucesso", description: "Lista de entradas atualizada." })
           setCompraToEdit(null)
        }}
        onNovoProduto={() => setShowNovoProdutoModal(true)}
        compraParaEditar={compraToEdit}
      />

      <ModalDetalhesCompra 
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        compraId={selectedCompraId}
      />

      <ModalCadastroProduto
        isOpen={showNovoProdutoModal}
        onClose={() => setShowNovoProdutoModal(false)}
        onSuccess={() => {
          fetchProdutos()
          setShowNovoProdutoModal(false)
        }}
      />

       {supplierToDelete && (
         <div className="modal-overlay" style={{zIndex: 50}}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold mb-2">Excluir Fornecedor</h3>
                <p className="mb-4">Tem certeza que deseja excluir <b>{supplierToDelete.nome}</b>?</p>
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setSupplierToDelete(null)}>Cancelar</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleConfirmDeleteSupplier} disabled={isDeletingSupplier}>
                        {isDeletingSupplier ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
         </div>
       )}

       {compraToDelete && (
         <div className="modal-overlay" style={{zIndex: 50}}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-2 text-red-600">Estornar Compra</h3>
                <p className="mb-4 text-sm text-gray-600">
                    Deseja realmente estornar esta compra? <br/>
                    <b className="text-gray-800">NF #{compraToDelete.notaFiscal}</b> - {compraToDelete.fornecedor?.nome}
                </p>
                <p className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded">
                    ⚠️ Isso removerá os produtos do estoque e cancelará os lançamentos financeiros.
                </p>
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setCompraToDelete(null)}>Cancelar</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleConfirmDeleteCompra} disabled={isDeletingCompra}>
                        {isDeletingCompra ? 'Estornando...' : 'Confirmar Estorno'}
                    </button>
                </div>
            </div>
         </div>
       )}
    </div>
  )
}
