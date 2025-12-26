'use client'

import { Sidebar } from '@/components/sidebar'
import { Search, MoreVertical, Edit2, Trash2, Home, ShoppingTag, FileText, Package, DollarSign, Users, BarChart2, User, Settings, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ItemVenda {
  id: number
  produto: {
    nome: string
  }
  quantidade: number
  precoUnitario: number
}

interface Cliente {
  nome: string
}

interface Venda {
  id: number
  totalVenda: string
  dataVenda: string
  status: string
  itens: ItemVenda[]
  cliente: Cliente | null
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchVendas()
  }, [])

  const fetchVendas = async () => {
    try {
      const response = await fetch('/api/vendas')
      if (!response.ok) throw new Error('Falha ao buscar vendas')
      const data = await response.json()
      setVendas(data)
    } catch (error) {
      console.error('Erro ao buscar vendas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de vendas.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value))
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'CONCLUIDA': 'bg-green-500 text-white',
      'PENDENTE': 'bg-yellow-400 text-black',
      'CANCELADA': 'bg-red-500 text-white',
    }
    const label: Record<string, string> = {
      'CONCLUIDA': 'Concluído',
      'PENDENTE': 'Pendente',
      'CANCELADA': 'Cancelado',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500 text-white'}`}>
        {label[status] || status}
      </span>
    )
  }

  const getItemDescription = (venda: Venda) => {
    if (!venda.itens || venda.itens.length === 0) return '-'
    const firstItem = venda.itens[0].produto?.nome || 'Item desconhecido'
    if (venda.itens.length > 1) {
      return `${firstItem} + ${venda.itens.length - 1} item(s)`
    }
    return firstItem
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-48 flex-1 p-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Vendas</h1>
            <div className="relative flex-1 max-w-2xl mx-8">
              <input
                type="text"
                placeholder="Procure por nome"
                className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                Histórico
              </button>
              <button className="px-6 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
                Pedido em aberto
              </button>
              <button className="px-6 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
                Pedido online
              </button>
              <button className="px-6 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
                Orçamentos
              </button>
            </div>

            <button className="px-6 py-2 bg-emerald-400 text-emerald-900 rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors shadow-sm">
              Nova Venda - F2
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-400 text-emerald-900 text-sm font-bold">
                <th className="px-6 py-4 text-left w-24">Ação</th>
                <th className="px-6 py-4 text-left">Número</th>
                <th className="px-6 py-4 text-left">Valor</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-left">Data e hora</th>
                <th className="px-6 py-4 text-left">Item</th>
                <th className="px-6 py-4 text-left">Cliente</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Valor Recbido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">Carregando vendas...</td>
                </tr>
              ) : vendas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">Nenhuma venda encontrada.</td>
                </tr>
              ) : (
                vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50 text-sm text-gray-600">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Edit2 className="w-4 h-4 text-green-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">{venda.id}</td>
                    <td className="px-6 py-4">{formatCurrency(venda.totalVenda)}</td>
                    <td className="px-6 py-4">Venda</td>
                    <td className="px-6 py-4">{formatDate(venda.dataVenda)}</td>
                    <td className="px-6 py-4">{getItemDescription(venda)}</td>
                    <td className="px-6 py-4">{venda.cliente?.nome || 'Cliente não identificado'}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(venda.status)}
                    </td>
                    <td className="px-6 py-4 text-right">{formatCurrency(venda.totalVenda)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
              Nova Pedido- F2
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
              Nova Orçamento - F2
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
              Troca ou Devolução
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">&lt;</button>
            <span>Página: <input type="text" value="1" className="w-8 text-center border border-gray-200 rounded" readOnly /> de 5</span>
            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">&gt;</button>
            <span className="ml-4">Linhas na página: 10</span>
          </div>
        </div>
      </main>
    </div>
  )
}
