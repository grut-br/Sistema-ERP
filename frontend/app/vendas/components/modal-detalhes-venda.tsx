"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Tag, Coins, CreditCard, Gift } from "lucide-react"

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
  }

  // Calcula o subtotal (antes de descontos)
  const calcularSubtotal = () => {
    if (!venda?.itens) return 0
    return venda.itens.reduce((sum: number, item: any) => sum + (item.precoUnitario * item.quantidade), 0)
  }

  // Calcula o total de descontos
  const calcularTotalDescontos = () => {
    return (venda?.descontoManual || 0) + (venda?.descontoPontos || 0)
  }

  // Calcula o total pago
  const calcularTotalPago = () => {
    if (!venda?.pagamentos) return 0
    return venda.pagamentos.reduce((sum: number, pag: any) => sum + (Number(pag.valor) || 0), 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header - Green to match table headers */}
        <div className="bg-emerald-500 text-white p-6 rounded-t-xl flex justify-between items-center">
           <div>
              <h2 className="text-xl font-bold">Detalhes da Venda #{vendaId}</h2>
              {venda && (
                 <div className="text-sm text-white/80 mt-1">
                    {new Date(venda.dataVenda).toLocaleString('pt-BR')} - 
                    <span className={`ml-2 font-semibold ${
                        venda.status === 'CONCLUIDA' ? 'text-green-200' : 'text-red-200'
                    }`}>{venda.status}</span>
                 </div>
              )}
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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
               <div className="space-y-6">
                   
                   {/* Cliente Section */}
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                       <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h3>
                       <div className="flex justify-between items-center">
                           <div className="font-medium text-lg text-gray-900">
                                {venda.cliente?.nome || "Consumidor Final"}
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
                                       <td className="p-3 text-right text-gray-600">{formatCurrency(item.precoUnitario)}</td>
                                       <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(item.precoUnitario * item.quantidade)}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                       
                       {/* Subtotal dos Itens */}
                       <div className="flex justify-end mt-2 pr-3">
                           <span className="text-sm text-gray-500">Subtotal dos Itens: </span>
                           <span className="ml-2 text-sm font-semibold text-gray-700">{formatCurrency(calcularSubtotal())}</span>
                       </div>
                   </div>

                   {/* Descontos Section */}
                   {calcularTotalDescontos() > 0 && (
                       <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                           <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                               <Tag size={16} />
                               Descontos Aplicados
                           </h3>
                           <div className="space-y-2">
                               {venda.descontoManual > 0 && (
                                   <div className="flex justify-between items-center text-sm">
                                       <span className="text-amber-800 flex items-center gap-2">
                                           <Tag size={14} />
                                           Desconto Manual
                                       </span>
                                       <span className="font-semibold text-amber-900">
                                           - {formatCurrency(venda.descontoManual)}
                                       </span>
                                   </div>
                               )}
                               {venda.descontoPontos > 0 && (
                                   <div className="flex justify-between items-center text-sm">
                                       <span className="text-amber-800 flex items-center gap-2">
                                           <Coins size={14} />
                                           Desconto Fidelidade (Pontos)
                                       </span>
                                       <span className="font-semibold text-amber-900">
                                           - {formatCurrency(venda.descontoPontos)}
                                       </span>
                                   </div>
                               )}
                               <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between items-center">
                                   <span className="text-sm font-medium text-amber-800">Total de Descontos</span>
                                   <span className="font-bold text-amber-900">- {formatCurrency(calcularTotalDescontos())}</span>
                               </div>
                           </div>
                       </div>
                   )}

                   {/* Pagamentos Section */}
                   <div className="grid grid-cols-2 gap-6">
                       <div>
                           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                               <CreditCard size={16} />
                               Formas de Pagamento
                           </h3>
                           <ul className="space-y-2">
                               {venda.pagamentos?.map((pag: any, idx: number) => (
                                   <li key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                       <span className="font-medium text-gray-700">{pag.metodo}</span>
                                       <span className="font-semibold text-gray-900">{formatCurrency(pag.valor)}</span>
                                   </li>
                               ))}
                           </ul>
                           
                           {/* Troco Display (Moved here by request) */}
                           {( (venda.troco && Number(venda.troco) > 0) || (calcularTotalPago() - Number(venda.totalVenda) > 0.01) ) && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                   <div className="flex justify-between items-center text-sm">
                                       <span className="text-blue-800 flex items-center gap-2">
                                           <Coins size={14} />
                                           {venda.troco > 0 
                                             ? `Troco em ${venda.destinoTroco || 'DINHEIRO'}` 
                                             : `Troco em ${venda.destinoTroco || 'DINHEIRO'}`}
                                       </span>
                                       <span className="font-bold text-blue-900">
                                           {formatCurrency(venda.troco > 0 
                                              ? venda.troco 
                                              : (calcularTotalPago() - Number(venda.totalVenda))
                                           )}
                                       </span>
                                   </div>
                                </div>
                            )}
                           
                           {/* Troco que virou crédito */}
                           {venda.creditoGerado > 0 && (
                               <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                   <div className="flex justify-between items-center text-sm">
                                       <span className="text-blue-800 flex items-center gap-2">
                                           <Gift size={14} />
                                           Troco convertido em Crédito
                                       </span>
                                       <span className="font-semibold text-blue-900">
                                           + {formatCurrency(venda.creditoGerado)}
                                       </span>
                                   </div>
                               </div>
                           )}
                       </div>
                       
                       <div className="flex flex-col items-end justify-end">
                           <div className="text-right space-y-1">
                               {calcularTotalDescontos() > 0 && (
                                   <>
                                       <div className="text-xs text-gray-400">Subtotal: {formatCurrency(calcularSubtotal())}</div>
                                       <div className="text-xs text-amber-600">Descontos: - {formatCurrency(calcularTotalDescontos())}</div>
                                   </>
                               )}
                               <div className="text-sm text-gray-500">Total da Venda</div>
                               <div className="text-3xl font-bold text-emerald-600">
                                   {formatCurrency(venda.totalVenda)}
                               </div>
                               {calcularTotalPago() > venda.totalVenda && (
                                   <div className="text-xs text-blue-600">
                                       Pago: {formatCurrency(calcularTotalPago())}
                                   </div>
                               )}
                               
                               {/* Change Display from Persistence */}
                               {(venda.troco > 0) && (
                                   <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-right">
                                       <span className="text-xs text-gray-500 block uppercase">Troco ({venda.destinoTroco || 'DINHEIRO'})</span>
                                       <span className="text-lg font-bold text-blue-700">{formatCurrency(venda.troco)}</span>
                                   </div>
                               )}
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
                <div></div>
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
