"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Search, Eye, FilterX, Plus } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/Pagination"
import { ModalDetalhesVenda } from "./components/modal-detalhes-venda"
import "./vendas.css"
import { Button } from "@/components/ui/button"

export default function VendasPage() {
  const { toast } = useToast()
  
  // -- Data State --
  const [vendasList, setVendasList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // -- Pagination State --
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // -- Filters State --
  const [searchId, setSearchId] = useState("")
  const [filterDateStart, setFilterDateStart] = useState("")
  const [filterDateEnd, setFilterDateEnd] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterClientName, setFilterClientName] = useState("")

  // -- Modal State --
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedVendaId, setSelectedVendaId] = useState<number | null>(null)

  useEffect(() => {
    fetchVendas()
  }, []) 

  // Debunce for fetch
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchVendas()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchId, filterDateStart, filterDateEnd, filterStatus, filterClientName])

  const fetchVendas = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (searchId) params.append('searchId', searchId)
      if (filterDateStart) params.append('dataInicio', filterDateStart)
      if (filterDateEnd) params.append('dataFim', filterDateEnd)
      if (filterStatus) params.append('status', filterStatus)
      if (filterClientName) params.append('clienteNome', filterClientName)

      const response = await fetch(`/api/vendas?${params.toString()}`)
      if (response.ok) {
        setVendasList(await response.json())
      } else {
        console.error("Erro ao buscar vendas")
      }
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoading(false)
    }
  }

  const clearFilters = () => {
      setSearchId("")
      setFilterDateStart("")
      setFilterDateEnd("")
      setFilterStatus("")
      setFilterClientName("")
      setCurrentPage(1)
  }

  const handleOpenDetalhes = (id: number) => {
    setSelectedVendaId(id)
    setShowDetalhesModal(true)
  }

  // Pagination logic
  const totalPages = Math.ceil(vendasList.length / itemsPerPage)
  const currentDisplayItems = vendasList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8 transition-all">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Vendas</h1>
            
            <div className="flex gap-4 items-center">
                 <div className="relative w-64">
                    <input 
                        type="text" 
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Buscar por ID (ex: 123)" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                 </div>

                 <Link href="/vendas/nova">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <Plus size={18} />
                        Nova Venda
                    </Button>
                 </Link>
            </div>
        </div>

        <div className="flex gap-6 items-start">
            {/* Sidebar de Filtros */}
            <aside className="w-[300px] bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Filtros</h3>
                
                <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">De:</span>
                            <input 
                                type="date" 
                                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                value={filterDateStart}
                                onChange={e => setFilterDateStart(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">Até:</span>
                            <input 
                                type="date" 
                                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                value={filterDateEnd}
                                onChange={e => setFilterDateEnd(e.target.value)}
                            />
                        </div>
                     </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="CONCLUIDA">Concluída</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>

                <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                     <input 
                        type="text"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                        placeholder="Nome do cliente"
                        value={filterClientName}
                        onChange={e => setFilterClientName(e.target.value)}
                     />
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
                                <th className="p-4 text-left font-bold">ID</th>
                                <th className="p-4 text-left font-bold">Data</th>
                                <th className="p-4 text-left font-bold">Cliente</th>
                                <th className="p-4 text-left font-bold">Valor Total</th>
                                <th className="p-4 text-center font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Carregando...</td></tr>
                            ) : currentDisplayItems.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhuma venda encontrada</td></tr>
                            ) : currentDisplayItems.map((venda: any) => (
                                <tr key={venda.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-center">
                                          <button 
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Ver Detalhes"
                                            onClick={() => handleOpenDetalhes(venda.id)}
                                          >
                                            <Eye size={20} />
                                          </button>
                                    </td>
                                    <td className="p-4 text-gray-700">#{venda.id}</td>
                                    <td className="p-4 text-gray-700">
                                        {new Date(venda.dataVenda).toLocaleDateString('pt-BR')} {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        {venda.cliente?.nome || <span className="text-gray-400 italic">Consumidor Final</span>}
                                    </td>
                                    <td className="p-4 text-gray-700 font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(venda.totalVenda || 0)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            venda.status === 'CONCLUIDA' ? 'bg-green-100 text-green-700' : 
                                            venda.status === 'CANCELADA' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {venda.status}
                                        </span>
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

      <ModalDetalhesVenda
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        vendaId={selectedVendaId}
        onCancelSuccess={() => {
            fetchVendas()
            toast({ title: "Venda Cancelada", description: "O status foi atualizado com sucesso." })
        }}
      />
    </div>
  )
}
