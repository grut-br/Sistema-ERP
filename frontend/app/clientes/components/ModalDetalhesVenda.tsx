"use client"

import { useEffect, useState } from "react"
import { X, ShoppingBag, Calendar, User, Package, CreditCard, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ItemVenda {
  id: number
  produto: {
    nome: string
    imagem?: string
  }
  quantidade: number
  precoUnitario: number
  subtotal: number
}

interface Pagamento {
  id: number
  valor: number
  metodo: string
  data: string
}

interface DetalhesVenda {
  id: number
  dataVenda: string
  status: string
  totalVenda: number
  desconto: number
  itens: ItemVenda[]
  pagamentos: Pagamento[]
  vendedor?: string
  observacoes?: string
}

interface ModalDetalhesVendaProps {
  isOpen: boolean
  onClose: () => void
  vendaId: number | null
}

export function ModalDetalhesVenda({ isOpen, onClose, vendaId }: ModalDetalhesVendaProps) {
  const { toast } = useToast()
  const [venda, setVenda] = useState<DetalhesVenda | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && vendaId) {
      fetchVendaDetalhes()
    } else {
      setVenda(null)
    }
  }, [isOpen, vendaId])

  const fetchVendaDetalhes = async () => {
    if (!vendaId) return
    setIsLoading(true)
    try {
      // Ajuste a rota conforme seu backend real. 
      // Supondo que /api/vendas/:id retorne os detalhes completos
      const response = await fetch(`/api/vendas/${vendaId}`)
      if (!response.ok) throw new Error("Erro ao buscar detalhes da venda")
      const data = await response.json()
      setVenda(data)
    } catch (error) {
      console.error(error)
      toast({ 
        title: "Erro", 
        description: "Não foi possível carregar os detalhes da venda.", 
        variant: "destructive" 
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="modal-overlay" style={{ zIndex: 70 }}>
      {/* zIndex maior que o do perfil para ficar por cima se necessário, 
          ou apenas alto o suficiente */}
      <div className="modal-content max-w-2xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header - Green to match table headers */}
        <div className="bg-emerald-500 text-white p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Venda #{vendaId}</h2>
              {venda && (
                <p className="text-sm text-white/80 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(venda.dataVenda).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : venda ? (
            <>
              {/* Status Banner */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                venda.status === 'CONCLUIDA' ? 'bg-green-50 border-green-200 text-green-700' :
                venda.status === 'CANCELADA' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-gray-50 border-gray-200 text-gray-700'
              }`}>
                <span className="font-semibold flex items-center gap-2">
                  <Tag size={18} />
                  Status: {venda.status}
                </span>
                {venda.vendedor && (
                  <span className="text-sm flex items-center gap-1 opacity-80">
                    <User size={14} />
                    Vendedor: {venda.vendedor}
                  </span>
                )}
              </div>

              {/* Itens */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Itens da Venda
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Produto</th>
                        <th className="px-4 py-2 text-center text-gray-600 font-medium">Qtd</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">Preço</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {venda.itens?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-gray-800">{item.produto.nome}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantidade}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatCurrency(item.precoUnitario)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-800">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagamentos */}
              {venda.pagamentos && venda.pagamentos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard size={18} />
                    Pagamentos
                  </h3>
                  <div className="grid gap-2">
                    {venda.pagamentos.map((pag, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="text-gray-700 font-medium">{pag.metodo}</span>
                        <span className="text-gray-600 text-sm">
                          {new Date(pag.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="font-bold text-gray-800">{formatCurrency(pag.valor)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(venda.totalVenda + (venda.desconto || 0))}</span>
                </div>
                {venda.desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>- {formatCurrency(venda.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(venda.totalVenda)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Venda não encontrada.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer border-t pt-4">
          <button onClick={onClose} className="btn-cancel w-full flex justify-center">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
