"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle } from "lucide-react"

interface ModalDetalhesVendaProps {
  isOpen: boolean
  onClose: () => void
  vendaId: number | null
  onCancelSuccess: () => void
}

export function ModalDetalhesVenda({ isOpen, onClose, vendaId, onCancelSuccess }: ModalDetalhesVendaProps) {
  const [venda, setVenda] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)

  useEffect(() => {
    if (isOpen && vendaId) {
      loadVenda(vendaId)
    } else {
        setVenda(null)
        setShowConfirmCancel(false)
    }
  }, [isOpen, vendaId])

  const loadVenda = async (id: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/vendas/${id}`)
      if (res.ok) {
        setVenda(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelVenda = async () => {
    if (!venda) return
    setIsCancelling(true)
    try {
        const res = await fetch(`/api/vendas/${venda.id}/cancelar`, {
            method: 'PATCH'
        })
        if (res.ok) {
            onCancelSuccess()
            onClose()
        } else {
            console.error("Erro ao cancelar venda")
        }
    } catch (e) {
        console.error(e)
    } finally {
        setIsCancelling(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <div>
              <h2 className="text-xl font-bold text-gray-800">Detalhes da Venda #{vendaId}</h2>
              {venda && (
                 <div className="text-sm text-gray-500 mt-1">
                    {new Date(venda.dataVenda).toLocaleString('pt-BR')} - 
                    <span className={`ml-2 font-semibold ${
                        venda.status === 'CONCLUIDA' ? 'text-green-600' : 'text-red-600'
                    }`}>{venda.status}</span>
                 </div>
              )}
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <X size={24} />
           </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
           {isLoading ? (
               <div className="flex justify-center py-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
               </div>
           ) : venda ? (
               <div className="space-y-8">
                   
                   {/* Cliente Section */}
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                       <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h3>
                       <div className="flex justify-between items-center">
                           <div className="font-medium text-lg text-gray-900">
                                {venda.cliente ? venda.cliente.nome : "Consumidor Final"}
                           </div>
                           {venda.cliente && venda.cliente.cpf && (
                               <div className="text-gray-500 text-sm">CPF: {venda.cliente.cpf}</div>
                           )}
                       </div>
                   </div>

                   {/* Itens Section */}
                   <div>
                       <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Itens</h3>
                       <table className="w-full text-sm">
                           <thead className="bg-gray-100 text-gray-600">
                               <tr>
                                   <th className="p-3 text-left rounded-l-lg">Produto</th>
                                   <th className="p-3 text-right">Qtd</th>
                                   <th className="p-3 text-right">Preço Unit.</th>
                                   <th className="p-3 text-right rounded-r-lg">Subtotal</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {venda.itens?.map((item: any, idx: number) => (
                                   <tr key={idx}>
                                       <td className="p-3 font-medium text-gray-900">{item.produto?.nome || "Item desconhecido"}</td>
                                       <td className="p-3 text-right text-gray-600">{item.quantidade}</td>
                                       <td className="p-3 text-right text-gray-600">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}
                                       </td>
                                       <td className="p-3 text-right font-semibold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario * item.quantidade)}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>

                   {/* Pagamentos Section */}
                   <div className="grid grid-cols-2 gap-8">
                       <div>
                           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pagamento</h3>
                           <ul className="space-y-2">
                               {venda.pagamentos?.map((pag: any, idx: number) => (
                                   <li key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                       <span className="font-medium text-gray-700">{pag.metodo}</span>
                                       <span className="font-semibold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pag.valor)}
                                       </span>
                                   </li>
                               ))}
                           </ul>
                       </div>
                       
                       <div className="flex flex-col items-end justify-center">
                           <div className="text-sm text-gray-500 mb-1">Total Geral</div>
                           <div className="text-3xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(venda.totalVenda)}
                           </div>
                       </div>
                   </div>

               </div>
           ) : (
               <div className="text-center text-gray-500">Venda não encontrada.</div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            
            {/* Cancel Logic */}
            {venda?.status === 'CONCLUIDA' ? (
                showConfirmCancel ? (
                    <div className="flex items-center gap-3 animate-in fade-in">
                        <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                            <AlertTriangle size={16}/> Confirmar cancelamento?
                        </span>
                        <button 
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                            onClick={() => setShowConfirmCancel(false)}
                            disabled={isCancelling}
                        >
                            Não
                        </button>
                        <button 
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                            onClick={handleCancelVenda}
                            disabled={isCancelling}
                        >
                            {isCancelling ? "Cancelando..." : "Sim, Cancelar"}
                        </button>
                    </div>
                ) : (
                    <button 
                        className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm font-medium transition-colors"
                        onClick={() => setShowConfirmCancel(true)}
                    >
                        Cancelar Venda
                    </button>
                )
            ) : (
                <div></div> // Spacer
            )}

            <button 
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium"
                onClick={onClose}
            >
                Fechar
            </button>
        </div>

      </div>
    </div>
  )
}
