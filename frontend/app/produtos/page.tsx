"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Search, MoreVertical, Pencil, Trash2, Camera } from "lucide-react"
import "./produtos.css"
import { Pagination } from "@/components/Pagination"
import { ModalNovaCategoria } from "./components/modal-nova-categoria"
import { ModalNovoFabricante } from "./components/modal-novo-fabricante"

import { ModalCadastroProduto } from "./components/modal-cadastro-produto"
import { ModalConfirmacao } from "./components/modal-confirmacao"


export default function ProdutosPage() {

  // Estado para controlar qual popup está aberto

  const [showAddModal, setShowAddModal] = useState(false) // Unified Create/Edit Modal
  
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)

  const [showNewFabricanteModal, setShowNewFabricanteModal] = useState(false)

  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("itens") // 'itens' | 'compras' | 'fornecedores' | 'categorias'
  
  // Category Edit/Delete State
  const [categoryToEdit, setCategoryToEdit] = useState<any | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  
  // Product Delete State
  const [productToDelete, setProductToDelete] = useState<any | null>(null)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)

  // Fabricante Edit/Delete State
  const [fabricanteToEdit, setFabricanteToEdit] = useState<any | null>(null)
  const [fabricanteToDelete, setFabricanteToDelete] = useState<any | null>(null)
  const [isDeletingFabricante, setIsDeletingFabricante] = useState(false)

  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // Estado dos dados
  const [produtos, setProdutos] = useState<any[]>([])
  const [categoriasList, setCategoriasList] = useState<any[]>([])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter State
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")
  const [selectedFabricanteFilter, setSelectedFabricanteFilter] = useState("")
  const [sortOption, setSortOption] = useState("id-desc") // 'id-asc', 'id-desc', 'name-asc', 'name-desc'
  const [sortOptionFabricante, setSortOptionFabricante] = useState("id-desc") // Separate sort for Manufacturers

  // Form State
  const [categorias, setCategorias] = useState<any[]>([])
  const [fabricantes, setFabricantes] = useState<any[]>([])
  // formData moved to ModalCadastroProduto

  useEffect(() => {
    if (activeTab === 'itens') fetchProdutos()

    if (activeTab === 'fabricantes') fetchFabricantesList()
    // Always fetch dropdown data
    fetchCategoriasList() 
    fetchFabricantesList()
  }, [activeTab])

  const fetchCategoriasList = async () => {
    try {
      // Don't toggle global loading if we are just fetching dropdown data in background for other tabs
      // But if we are in 'categorias' tab, we might want loading. 
      // For simplicity, let's keep it silent or minimal to avoid flickering if tab is not 'categorias'
      // But user complained about 'fetchCategorias is not defined' so we just fix the reference.
      // To be safe with the loading state collision:
      if (activeTab === 'categorias') setIsLoading(true)
      
      const response = await fetch('/api/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategoriasList(data) // For the table
        setCategorias(data)     // For the dropdown
      }
    } catch (e) {
      console.error(e)
    } finally {
      if (activeTab === 'categorias') setIsLoading(false)
    }
  }

  const fetchFabricantesList = async () => {
    try {
      const response = await fetch('/api/fabricantes')
      if (response.ok) {
        const data = await response.json()
        setFabricantes(data) // Dropdown and potentially list if we had a tab for them
      }
    } catch (e) {
      console.error(e)
    }
  }



  const fetchProdutos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/produtos')
      if (!response.ok) throw new Error('Falha ao carregar produtos')
      const data = await response.json()
      setProdutos(data)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtering Logic (Client-Side)
  const getFilteredItems = () => {
    let items = activeTab === 'itens' ? produtos : 
                activeTab === 'categorias' ? categoriasList : 
                activeTab === 'fabricantes' ? fabricantes : []

    // Search Bar Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      items = items.filter(item => 
        item.nome?.toLowerCase().includes(lowerTerm) || 
        item.codigoBarras?.toLowerCase().includes(lowerTerm)
      )
    }

    // Sorting
    if (activeTab === 'itens') {
      items.sort((a, b) => {
        if (sortOption === 'name-asc') return a.nome.localeCompare(b.nome)
        if (sortOption === 'name-desc') return b.nome.localeCompare(a.nome)
        if (sortOption === 'preco-asc') return a.precoVenda - b.precoVenda
        if (sortOption === 'preco-desc') return b.precoVenda - a.precoVenda
        

        return 0
      })
    }

    if (activeTab === 'categorias') {
      items.sort((a, b) => {
        if (sortOption === 'id-asc') return a.id - b.id
        if (sortOption === 'id-desc') return b.id - a.id
        if (sortOption === 'name-asc') return a.nome.localeCompare(b.nome)
        if (sortOption === 'name-desc') return b.nome.localeCompare(a.nome)
        return 0
      })
    }



    if (activeTab === 'fabricantes') {
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase()
        items = items.filter(f => f.nome?.toLowerCase().includes(lowerTerm))
      }

      items.sort((a, b) => {
        if (sortOptionFabricante === 'id-asc') return a.id - b.id
        if (sortOptionFabricante === 'id-desc') return b.id - a.id
        if (sortOptionFabricante === 'name-asc') return a.nome.localeCompare(b.nome)
        if (sortOptionFabricante === 'name-desc') return b.nome.localeCompare(a.nome)
        return 0
      })
    }

    // Sidebar Filters (Only for Itens)
    if (activeTab === 'itens') {
      if (selectedCategoryFilter) {
        items = items.filter(p => p.idCategoria === Number(selectedCategoryFilter) || p.categoria?.id === Number(selectedCategoryFilter))
      }
      if (selectedFabricanteFilter) {
        items = items.filter(p => p.idFabricante === Number(selectedFabricanteFilter) || p.fabricante?.id === Number(selectedFabricanteFilter))
      }
    }

    return items
  }

  const currentItemsList = getFilteredItems()

  const totalPages = Math.ceil(currentItemsList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDisplayItems = currentItemsList.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) 
  }

  const handleTabs = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  //Ordem dos botões das tabs/abas
  const tabs = [
    { id: "itens", label: "Itens" },
    { id: "categorias", label: "Categorias" },
    { id: "fabricantes", label: "Fabricantes" },
  ]

  // Helpers
  const formatCurrency = (value: number | string) => {
    const numValue = Number(value)
    if (isNaN(numValue)) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  }

  // Função para retornar o status do produto
  const getProductStatus = (estoque: number, status: string, estoqueMinimo: number = 5) => {
    if (status === 'INATIVO') return { label: "Inativo", className: "status-badge inactive" }
    if (estoque <= 0) return { label: "Esgotado", className: "status-badge out" }
    if (estoque <= estoqueMinimo) return { label: "Baixo estoque", className: "status-badge low" }
    return { label: "Em estoque", className: "status-badge active" }
  }

  // Função para excluir um produto
  const openDeleteProduct = (product: any) => {
    setProductToDelete(product)
  }

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return
    
    setIsDeletingProduct(true)
    try {
      const response = await fetch(`/api/produtos/${productToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Falha ao excluir produto')

      setProdutos(produtos.filter(p => p.id !== productToDelete.id))
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso."
      })
      setProductToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive"
      })
    } finally {
        setIsDeletingProduct(false)
    }
  }

  // Função para abrir o popup de visualização/edição
  const handleViewProduct = (product: any) => {
    setEditingProduct(product)
    setShowAddModal(true)
  }

  const handleProductSuccess = () => {
    fetchProdutos()
    // setShowAddModal(false) // Modal handles closing or keeping open
  }

  const handleCategorySuccess = () => {
    fetchCategoriasList()
  }

  const handleFabricanteSuccess = () => {
    fetchFabricantesList()
  }

  // Categoria Handlers
  const openEditCategory = (category: any) => {
    setCategoryToEdit(category)
    setShowNewCategoryModal(true)
  }

  const openDeleteCategory = (category: any) => {
    setCategoryToDelete(category)
  }

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    setIsDeletingCategory(true)
    try {
      const response = await fetch(`/api/categorias/${categoryToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Falha ao excluir categoria')

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso."
      })
      
      fetchCategoriasList()
      setCategoryToDelete(null)

    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingCategory(false)
    }
  }



  // Fabricante Handlers
  const openEditFabricante = (fabricante: any) => {
    setFabricanteToEdit(fabricante)
    setShowNewFabricanteModal(true)
  }

  const openDeleteFabricante = (fabricante: any) => {
    setFabricanteToDelete(fabricante)
  }

  const handleConfirmDeleteFabricante = async () => {
    if (!fabricanteToDelete) return
    setIsDeletingFabricante(true)
    try {
        const response = await fetch(`/api/fabricantes/${fabricanteToDelete.id}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            throw new Error(data.error || 'Falha ao excluir fabricante')
        }
        
        toast({ title: "Sucesso", description: "Fabricante excluído com sucesso." })
        fetchFabricantesList()
        setFabricanteToDelete(null)
    } catch (e: any) {
        console.error(e)
        // If error message mentions association, user friendly message
        const msg = e.message.includes("produtos associados") 
            ? "Este fabricante não pode ser excluído pois possui produtos associados."
            : (e.message || "Erro ao excluir");
            
        toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
        setIsDeletingFabricante(false)
    }
  }

  return (
    <div className="produtos-layout">
      {/* Sidebar lateral - Sempre visível */}
      <Sidebar />

      <div className="produtos-content">
        {/* Header com título e busca */}
        <div className="produtos-header">
          <h1>Produtos</h1>
          <div className="search-bar">
            {/* Header Input agora é a busca principal */}
            <input 
              type="text" 
              placeholder="Procure por nome" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            <Search className="search-icon" />
          </div>
        </div>

        <div className="produtos-main">
            {/* Painel de Filtros à esquerda */}
          <aside className="filters-panel">
            <h3>Filtros</h3>

            {activeTab === 'itens' && (
              <>
                {/* Removido o input de texto duplicado */}
                
                <div className="filter-group">
                  <label>Categorias</label>
                  <select 
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  >
                    <option value="">Todas as Categorias</option>
                     {categorias.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Fabricantes</label>
                  <select
                    value={selectedFabricanteFilter}
                    onChange={(e) => setSelectedFabricanteFilter(e.target.value)}
                  >
                    <option value="">Todos os Fabricantes</option>
                    {fabricantes.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              <div className="filter-group">
                  <label>Ordenar por</label>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                    <option value="preco-asc">Preço (Menor - Maior)</option>
                    <option value="preco-desc">Preço (Maior - Menor)</option>
                  </select>
              </div>
              </>
            )}



            {(activeTab === 'categorias') && (
               <div className="filter-group">
                  <label>Ordenar por</label>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                    <option value="id-desc">ID (Decrescente)</option>
                    <option value="id-asc">ID (Crescente)</option>
                  </select>
                </div>
            )}

            {(activeTab === 'fabricantes') && (
               <div className="filter-group">
                  <label>Ordenar por</label>
                  <select 
                    value={sortOptionFabricante}
                    onChange={(e) => setSortOptionFabricante(e.target.value)}
                  >
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                    <option value="id-desc">ID (Decrescente)</option>
                    <option value="id-asc">ID (Crescente)</option>
                  </select>
                </div>
            )}



            <button className="btn-filter">Pesquisar</button>
            {/* A pesquisa é 'live' ao alterar os inputs, mas o botão pode servir para forçar refresh ou UX */}
          </aside>

          {/* Área principal com tabela */}
          <div className="table-section">
            {/* Abas superiores */}
            <div className="tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => handleTabs(tab.id)}
                >
                  {tab.label}
                </button>
              ))}

              {/* Botão Dinâmico */}
              {activeTab === 'itens' && (
                <button className="btn-cadastrar" onClick={() => {
                  setEditingProduct(null)
                  setShowAddModal(true)
                }}>
                  Cadastrar Produto +
                </button>
              )}

              {activeTab === 'categorias' && (
                <button className="btn-cadastrar" onClick={() => {
                  setCategoryToEdit(null)
                  setShowNewCategoryModal(true)
                }}>
                  Nova Categoria +
                </button>
              )}

               {activeTab === 'fabricantes' && (
                <button className="btn-cadastrar" onClick={() => {
                    setFabricanteToEdit(null)
                    setShowNewFabricanteModal(true)
                }}>
                  Novo Fabricante +
                </button>
              )}
            </div>

            {/* Tabela Dinâmica */}
            <div className="table-wrapper">
              
              {/* TABELA ITENS */}
              {activeTab === 'itens' && (
                <table className="produtos-table">
                  <thead>
                    <tr>
                      <th className="w-[10%] text-center whitespace-nowrap">Ação</th>
                      <th className="w-[30%] whitespace-nowrap">Nome</th>
                      <th className="w-[15%] whitespace-nowrap">Categoria</th>
                      <th className="w-[10%] whitespace-nowrap">Preço</th>
                      <th className="w-[8%] whitespace-nowrap">Estoque</th>
                      <th className="w-[10%] whitespace-nowrap">Status</th>
                      <th className="w-[12%] whitespace-nowrap">Fabricante</th>
                      <th className="w-[10%] whitespace-nowrap">Código</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="text-center py-8">Carregando...</td></tr>
                    ) : currentDisplayItems.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8">Nenhum produto encontrado</td></tr>
                    ) : currentDisplayItems.map((produto) => {
                      const status = getProductStatus(produto.estoque || 0, produto.status || 'ATIVO', produto.estoqueMinimo || 5)
                      return (
                      <tr key={produto.id}>
                        <td>
                          <div className="flex justify-center items-center gap-2">
                             <button
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                              title="Editar"
                              onClick={() => handleViewProduct(produto)}
                             >
                               <Pencil size={18} />
                             </button>
                             <button 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir"
                              onClick={() => openDeleteProduct(produto)}
                             >
                               <Trash2 size={18} />
                             </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">{produto.nome}</td>
                        <td className="whitespace-nowrap">{produto.categoria?.nome || produto.categoria || "Sem Categoria"}</td>
                        <td className="whitespace-nowrap">{formatCurrency(produto.precoVenda || produto.preco)}</td>
                        <td className="whitespace-nowrap">{produto.estoque || 0}</td>
                        <td className="whitespace-nowrap">
                          {status && <span className={status.className}>{status.label}</span>}
                        </td>
                        <td className="whitespace-nowrap">{produto.fabricante?.nome || "-"}</td>
                        <td className="whitespace-nowrap">{produto.codigoBarras || produto.codigo}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}



               {/* TABELA CATEGORIAS */}
               {activeTab === 'categorias' && (
                <table className="produtos-table">
                  <thead>
                    <tr>
                      <th className="w-[15%] text-center whitespace-nowrap">Ações</th>
                      <th className="w-[40%] whitespace-nowrap">Nome</th>
                      <th className="w-[10%] whitespace-nowrap">ID</th>
                      <th className="w-[35%] whitespace-nowrap">Data Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={4} className="text-center py-8">Carregando...</td></tr>
                    ) : currentDisplayItems.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8">Nenhuma categoria encontrada</td></tr>
                    ) : currentDisplayItems.map((c: any) => (
                      <tr key={c.id}>
                        <td>
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                              title="Editar"
                              onClick={() => openEditCategory(c)}
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir"
                              onClick={() => openDeleteCategory(c)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">{c.nome}</td>
                        <td className="whitespace-nowrap">{c.id}</td>
                        <td className="whitespace-nowrap">
                          {c.dataCadastro 
                            ? new Date(c.dataCadastro).toLocaleDateString('pt-BR') 
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABELA FABRICANTES */}
              {activeTab === 'fabricantes' && (
                <table className="produtos-table">
                  <thead>
                    <tr>
                      <th className="w-[15%] text-center whitespace-nowrap">Ações</th>
                      <th className="w-[45%] whitespace-nowrap">Nome</th>
                      <th className="w-[10%] whitespace-nowrap">ID</th>
                      <th className="w-[30%] whitespace-nowrap">Data Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={3} className="text-center py-8">Carregando...</td></tr>
                    ) : currentDisplayItems.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-8">Nenhum fabricante encontrado</td></tr>
                    ) : currentDisplayItems.map((f: any) => (
                      <tr key={f.id}>
                        <td>
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                              title="Editar"
                              onClick={() => openEditFabricante(f)}
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir"
                              onClick={() => openDeleteFabricante(f)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">{f.nome}</td>
                        <td className="whitespace-nowrap">{f.id}</td>
                        <td className="whitespace-nowrap">
                          {f.dataCadastro 
                            ? new Date(f.dataCadastro).toLocaleDateString('pt-BR') 
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}



            </div>

            {/* Paginação */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* POPUP 1: Cadastrar novo item (Tela Produtos 3) */}
      {/* Aparece ao clicar no botão "Cadastrar +" */}
      {/* ============================================ */}
      <ModalCadastroProduto 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleProductSuccess}
        produtoParaEditar={editingProduct}
      />

      {/* ============================================ */}
      {/* POPUP 3: Nova Categoria */}
      {/* ============================================ */}
      <ModalNovaCategoria 
        isOpen={showNewCategoryModal}
        onClose={() => setShowNewCategoryModal(false)}
        onSuccess={() => {
           handleCategorySuccess()
           if (activeTab === 'categorias') fetchCategoriasList()
        }}
        categoriaParaEditar={categoryToEdit}
      />

      <ModalConfirmacao
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        titulo="Excluir Categoria"
        mensagem={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        isLoading={isDeletingCategory}
      />



       <ModalConfirmacao
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDeleteProduct}
        titulo="Excluir Produto"
        mensagem={`Tem certeza que deseja excluir o produto "${productToDelete?.nome}"?`}
        confirmText="Excluir"
        variant="danger"
        isLoading={isDeletingProduct}
      />

      <ModalNovoFabricante
        isOpen={showNewFabricanteModal}
        onClose={() => setShowNewFabricanteModal(false)}
        onSuccess={handleFabricanteSuccess}
        fabricanteParaEditar={fabricanteToEdit}
      />
      
      <ModalConfirmacao
        isOpen={!!fabricanteToDelete}
        onClose={() => setFabricanteToDelete(null)}
        onConfirm={handleConfirmDeleteFabricante}
        titulo="Excluir Fabricante"
        mensagem={`Tem certeza que deseja excluir o fabricante "${fabricanteToDelete?.nome}"?`}
        confirmText="Excluir"
        variant="danger"
        isLoading={isDeletingFabricante}
      />

    </div>
  )
}
