"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Search, Pencil, Trash2, Eye } from "lucide-react"
import { Pagination } from "@/components/Pagination"
import { ModalFornecedor } from "./components/modal-fornecedor"
import { ModalNovaEntrada } from "./components/modal-nova-entrada"
import { ModalDetalhesCompra } from "./components/modal-detalhes-compra"
import "./compras.css"

export default function ComprasPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("entradas") // 'entradas' | 'fornecedores'
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Data State
  const [fornecedoresList, setFornecedoresList] = useState<any[]>([])
  const [comprasList, setComprasList] = useState<any[]>([])
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Purchase Modal State
  const [showNewEntradaModal, setShowNewEntradaModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedCompraId, setSelectedCompraId] = useState<number | null>(null)

  // Supplier Edit/Delete State
  const [showNewFornecedorModal, setShowNewFornecedorModal] = useState(false)
  const [fornecedorToEdit, setFornecedorToEdit] = useState<any | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<any | null>(null)
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false)

  // Sorting
  const [sortOptionFornecedor, setSortOptionFornecedor] = useState("id-desc")

  useEffect(() => {
    if (activeTab === 'fornecedores') fetchFornecedores()
    if (activeTab === 'entradas') fetchCompras()
  }, [activeTab])

  const fetchCompras = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/compras')
      if (response.ok) {
        setComprasList(await response.json())
      }
    } catch (e) {
        console.error(e)
        toast({ title: "Erro", description: "Falha ao carregar compras", variant: "destructive" })
    } finally {
        setIsLoading(false)
    }
  }

  const fetchFornecedores = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/fornecedores')
      if (response.ok) {
        setFornecedoresList(await response.json())
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Erro", description: "Falha ao carregar fornecedores", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter & Sort Logic
  const getFilteredItems = () => {
    let items = activeTab === 'fornecedores' ? fornecedoresList : 
                activeTab === 'entradas' ? comprasList : []

    // Search
    if (activeTab === 'fornecedores' && searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      const cleanSearch = lowerTerm.replace(/[^0-9a-z]/g, "")
        
      items = items.filter(f => {
          const cleanCnpj = (f.cnpj || "").replace(/[^0-9a-z]/g, "") 
          return f.nome?.toLowerCase().includes(lowerTerm) || cleanCnpj.includes(cleanSearch)
      })
    }

    // Sort
    if (activeTab === 'fornecedores') {
      items.sort((a, b) => {
        if (sortOptionFornecedor === 'id-asc') return a.id - b.id
        if (sortOptionFornecedor === 'id-desc') return b.id - a.id
        if (sortOptionFornecedor === 'name-asc') return a.nome.localeCompare(b.nome)
        if (sortOptionFornecedor === 'name-desc') return b.nome.localeCompare(a.nome)
        return 0
      })
    }

    return items
  }

  const currentItemsList = getFilteredItems()
  const totalPages = Math.ceil(currentItemsList.length / itemsPerPage)

  // Handlers
  const handleTabs = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm("")
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
        const msg = e.message.includes("produtos associados") // Assuming backend protects this
            ? "Não é possível excluir fornecedor com produtos associados."
            : (e.message || "Erro ao excluir");
        toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
        setIsDeletingSupplier(false)
    }
  }

  const currentDisplayItems = currentItemsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="produtos-layout">
      <Sidebar />
      <div className="produtos-content">
        <div className="produtos-header">
            <h1>Compras</h1>
             <div className="search-bar">
                {activeTab === 'fornecedores' && (
                    <>
                        <input 
                        type="text" 
                        placeholder="Buscar Fornecedor (Nome ou CNPJ)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="search-icon" />
                    </>
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
                     <div className="text-sm text-gray-500 p-2">
                        Filtros de Data (Em breve)
                     </div>
                 )}
                 
                 <button className="btn-filter">Pesquisar</button>
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
                                    <th className="whitespace-nowrap">Data</th>
                                    <th className="whitespace-nowrap">Fornecedor</th>
                                    <th className="whitespace-nowrap">Nota Fiscal</th>
                                    <th className="whitespace-nowrap">Valor Total</th>
                                    <th className="whitespace-nowrap">Observações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-8">Carregando...</td></tr>
                                ) : currentDisplayItems.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8">Nenhuma entrada encontrada</td></tr>
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
                                              {/* 
                                              <button className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-50 cursor-not-allowed" title="Excluir (Em breve)">
                                                 <Trash2 size={18} />
                                              </button> 
                                              */}
                                          </div>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            {compra.dataCompra ? new Date(compra.dataCompra).toLocaleDateString('pt-BR') : "-"}
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
        onClose={() => setShowNewEntradaModal(false)}
        onSuccess={() => {
           fetchCompras()
           toast({ title: "Sucesso", description: "Lista de entradas atualizada." })
        }}
      />

      <ModalDetalhesCompra 
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        compraId={selectedCompraId}
      />

       {/* Confirm Delete Modal (Inline simple version or reusing component?) */}
       {/* Let's skip the ModalConfirmacao import for now and use a simple confirm or add it if strictly required. 
           User didn't strictly ask for 'ModalConfirmacao' but implied 'Editar/Excluir' working. 
           I implemented the logic but missing the Modal UI part for delete confirmation.
           I should actually copy the ModalConfirmacao usage from products page.
       */}
       
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
    </div>
  )
}
