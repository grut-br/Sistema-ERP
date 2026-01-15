"use client"

import { useState, useEffect } from "react"
import { X, Trophy, AlertTriangle, AlertCircle, Trash2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface ModalCheckoutProps {
  isOpen: boolean
  onClose: () => void
  cartTotal: number
  subtotalOriginal: number
  discountValue: number
  cliente: any | null
  cartItems: any[]
  onSuccess: () => void
  clientesList?: any[]
  onClienteChange?: (cliente: any) => void
  onNovoCliente?: () => void
}

export function ModalCheckout({ isOpen, onClose, cartTotal, subtotalOriginal, discountValue, cliente, cartItems, onSuccess, clientesList = [], onClienteChange, onNovoCliente }: ModalCheckoutProps) {
  const { toast } = useToast()
  
  // -- Payment State --
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [metodo, setMetodo] = useState("DINHEIRO")
  const [valorPagamento, setValorPagamento] = useState("")
  
  // -- Fidelity State --
  const [usarFidelidade, setUsarFidelidade] = useState(false)
  const [usarCredito, setUsarCredito] = useState(false)
  const [descontoFidelidade, setDescontoFidelidade] = useState(0)

  // -- Final Calculation --
  // Valor que PODE ser resgatado em pontos (sempre calculado para mostrar no botão)
  const pontosDisponiveis = cliente?.pontos || 0
  const valorPontosDisponivel = pontosDisponiveis * 0.05
  
  // Valor de crédito disponível
  const creditoDisponivel = cliente?.saldoCredito || 0
  
  // Desconto de fidelidade aplicado (só quando usarFidelidade = true)
  const valorDescontoFidelidade = usarFidelidade ? valorPontosDisponivel : 0
  
  // Limit discount to total (cannot be negative)
  const realDiscount = Math.min(valorDescontoFidelidade, cartTotal)
  const finalTotal = Math.max(0, cartTotal - realDiscount)

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0)
  const restante = Math.max(0, finalTotal - totalPago)

  // -- Change & Credit State --
  const [destinoTroco, setDestinoTroco] = useState<'DINHEIRO' | 'PIX' | 'CREDITO'>('DINHEIRO')
  const troco = Math.max(0, totalPago - finalTotal)
  
  // -- Alerts State --
  const [alertFiadoLevel, setAlertFiadoLevel] = useState<'NONE' | 'WARNING' | 'CRITICAL'>('NONE')

  useEffect(() => {
     if (isOpen) {
         setPagamentos([])
         setMetodo("DINHEIRO")
         setValorPagamento(Math.max(0, cartTotal).toFixed(2)) // Inicializa com total sem desconto pra user decidir
         setUsarFidelidade(false)
         setUsarCredito(false)
         setAlertFiadoLevel('NONE')
         setDestinoTroco('DINHEIRO')
     }
  }, [isOpen])

  // Recalculates remaining when total changes (points applied) or payments change
  useEffect(() => {
     const newRestante = Math.max(0, finalTotal - totalPago)
     if (newRestante > 0) {
         setValorPagamento(newRestante.toFixed(2))
     } else {
         setValorPagamento("")
     }
     
     // 1. Correção de Estado (Inicialização Automática)
     // Se pagou e tem troco, garante que haja um destino definido
     const currentTroco = totalPago - finalTotal
     if (currentTroco > 0 && !destinoTroco) {
        setDestinoTroco('DINHEIRO')
     }
  }, [finalTotal, totalPago, metodo, destinoTroco])

  const handleAddPagamento = () => {
      const valor = parseFloat(valorPagamento)
      if (!valor || valor <= 0) return
      
      // VALIDATION: CREDITO (Saldo em Conta)
      if (metodo === 'CREDITO') {
          if (!cliente) {
              toast({ title: "Erro", description: "Cliente não identificado.", variant: "destructive" })
              return
          }
           if (valor > (cliente.saldoCredito || 0)) {
              toast({ title: "Erro", description: "Saldo insuficiente.", variant: "destructive" })
              return
           }
      }

      // FIADO VALIDATION
      if (metodo === 'FIADO') {
          if (!cliente) {
              toast({ title: "Erro", description: "Selecione um cliente para vender fiado.", variant: "destructive" })
              return
          }
          const limite = parseFloat(cliente.limiteFiado || 0)
          
          if (valor > limite) {
             const excesso = valor - limite;
             const percent = (excesso / limite) * 100
             if (percent > 20) setAlertFiadoLevel('CRITICAL')
             else setAlertFiadoLevel('WARNING')
          }
      }

      setPagamentos([...pagamentos, { metodo, valor, salvarTrocoCredito: false }])
  }

  const removePagamento = (idx: number) => {
      const newPags = [...pagamentos]
      newPags.splice(idx, 1)
      setPagamentos(newPags)
      setAlertFiadoLevel('NONE') // Reset alert on remove
  }

  const handleFinalizar = async () => {
      console.log("handleFinalizar initiated [DEBUG]"); // Confirmar clique
      
      // Validations
      if (restante > 0.01) {
          toast({ title: "Erro", description: `Falta pagar: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(restante)}`, variant: "destructive" })
          return
      }

      // Validação explícita do Destino do Troco
      if (troco > 0 && !destinoTroco) {
          toast({ title: "Atenção", description: "Por favor, selecione uma opção para o troco.", variant: "destructive" })
          return; // Stop here
      }

      toast({ title: "Processando", description: "Enviando venda..." })

      const payload = {
          clienteId: cliente?.id || null,
          itens: cartItems.map(i => ({ idProduto: i.idProduto, quantidade: i.quantidade, precoUnitario: i.precoUnitario })),
          pagamentos: pagamentos.map(p => ({ ...p, salvarTrocoCredito: false })), 
          destinoTroco: troco > 0 ? destinoTroco : null,
          pontosUsados: usarFidelidade ? cliente?.pontos : 0,
          descontoManual: discountValue || 0
      }

      console.log("PAYLOAD VENDA:", JSON.stringify(payload, null, 2))
      
      try {
          const res = await fetch('/api/vendas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          })
          
          if (res.ok) {
              onSuccess()
              onClose()
              toast({ title: "Sucesso", description: "Venda realizada!" })
          } else {
              const err = await res.json()
              const msg = err.error || "Falha ao processar venda"
              
              if (msg.includes("Caixa") && msg.includes("fechado")) {
                  toast({ title: "Caixa Fechado", description: msg, variant: "destructive" })
              } else {
                  toast({ title: "Erro na Venda", description: msg, variant: "destructive" })
              }
          }
      } catch (e: any) {
          console.error(e)
          const msg = e.message || "Erro de conexão"
          // Se for erro de caixa fechado, mostra como Warning, não erro crítico
          if (msg.includes("Caixa") && msg.includes("fechado")) {
              toast({ title: "Caixa Fechado", description: msg, variant: "destructive" })
          } else {
              toast({ title: "Erro na Venda", description: msg, variant: "destructive" })
          }
      }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden">
        
        {/* Left: Summary */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo</h2>
            
            {/* Cliente selecionado - apenas nome */}
            {cliente && cliente.id && (
                <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Cliente</div>
                    <div className="font-bold text-gray-800">{cliente.nome}</div>
                </div>
            )}

            <div className="space-y-3 mt-auto">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalOriginal)}</span>
                </div>
                {discountValue > 0 && (
                    <div className="flex justify-between text-red-500 font-medium animate-in fade-in">
                        <span>Desconto</span>
                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountValue)}</span>
                    </div>
                )}
                {usarFidelidade && (
                     <div className="flex justify-between text-green-600 font-medium">
                        <span>Desconto Fidelidade</span>
                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(realDiscount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}</span>
                </div>
            </div>
        </div>

        {/* Right: Client + Payments */}
        <div className="w-2/3 p-6 flex flex-col overflow-hidden">
             {/* Header with Close Button */}
             <div className="flex justify-end mb-4">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
             </div>

             {/* Client Selection Section */}
             <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <div className="flex justify-between items-center mb-3">
                     <h3 className="text-sm font-semibold text-gray-500 uppercase">Cliente</h3>
                     {onNovoCliente && (
                         <button 
                             onClick={onNovoCliente}
                             className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded"
                         >
                             <UserPlus size={12} />
                             Novo Cliente
                         </button>
                     )}
                 </div>
                 
                 <select
                     className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 font-medium mb-3"
                     value={cliente?.id || ""}
                     onChange={(e) => {
                         if (e.target.value === "") {
                             onClienteChange && onClienteChange(null)
                         } else {
                             const clienteSelecionado = clientesList.find(c => c.id === Number(e.target.value))
                             if (clienteSelecionado && onClienteChange) {
                                 onClienteChange(clienteSelecionado)
                             }
                         }
                     }}
                 >
                     <option value="">Consumidor Final</option>
                     {clientesList.map((c) => (
                         <option key={c.id} value={c.id}>{c.nome}</option>
                     ))}
                 </select>
                 
                 {/* Cliente Info Cards + Actions */}
                 {cliente && cliente.id && (
                     <div className="flex gap-3 items-start">
                         {/* Info Cards */}
                         <div className="flex gap-2 flex-1">
                             <div className="bg-blue-50 px-3 py-2 rounded border border-blue-100 flex-1">
                                 <span className="text-[10px] text-blue-600 block uppercase font-medium">Limite Fiado</span>
                                 <span className="font-bold text-blue-800 text-sm">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.limiteFiado || 0)}
                                 </span>
                             </div>
                             <div className="bg-purple-50 px-3 py-2 rounded border border-purple-100 flex-1">
                                 <span className="text-[10px] text-purple-600 block uppercase font-medium">Pontos</span>
                                 <span className="font-bold text-purple-800 text-sm">{cliente.pontos || 0}</span>
                             </div>
                             <div className="bg-emerald-50 px-3 py-2 rounded border border-emerald-100 flex-1">
                                 <span className="text-[10px] text-emerald-600 block uppercase font-medium">Saldo Crédito</span>
                                 <span className="font-bold text-emerald-800 text-sm">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.saldoCredito || 0)}
                                 </span>
                             </div>
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex flex-col gap-1">
                             {cliente.pontos > 0 && (
                                 <button 
                                     className={`text-xs px-3 py-1.5 rounded font-bold border transition-colors ${usarFidelidade 
                                         ? 'bg-red-100 text-red-600 border-red-200' 
                                         : 'bg-purple-100 text-purple-600 border-purple-200'}`}
                                     onClick={() => setUsarFidelidade(!usarFidelidade)}
                                 >
                                     <Trophy size={12} className="inline mr-1" />
                                     {usarFidelidade ? 'Remover Pts' : `Usar ${cliente.pontos} pts`}
                                 </button>
                             )}
                             {creditoDisponivel > 0 && (
                                 <button 
                                     className={`text-xs px-3 py-1.5 rounded font-bold border transition-colors ${usarCredito 
                                         ? 'bg-red-100 text-red-600 border-red-200' 
                                         : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}
                                     onClick={() => {
                                         if (!usarCredito) {
                                             const valorUsar = Math.min(creditoDisponivel, restante > 0 ? restante : finalTotal)
                                             if (valorUsar > 0) {
                                                 setPagamentos([...pagamentos, { metodo: 'CREDITO', valor: valorUsar, salvarTrocoCredito: false }])
                                             }
                                         } else {
                                             setPagamentos(pagamentos.filter(p => p.metodo !== 'CREDITO'))
                                         }
                                         setUsarCredito(!usarCredito)
                                     }}
                                 >
                                     💰 {usarCredito ? 'Remover' : 'Usar Crédito'}
                                 </button>
                             )}
                         </div>
                     </div>
                 )}
             </div>

             {/* Payment Section */}
             <h3 className="text-lg font-bold text-gray-800 mb-4">Pagamento</h3>

             {/* Warnings */}
             {alertFiadoLevel === 'WARNING' && (
                 <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex gap-3 mb-4 animate-in slide-in-from-top-2">
                     <AlertCircle className="shrink-0" />
                     <div>
                         <p className="font-bold">Atenção: Limite Excedido</p>
                         <p className="text-sm">O valor fiado excede o limite disponível.</p>
                     </div>
                 </div>
             )}
              {alertFiadoLevel === 'CRITICAL' && (
                 <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex gap-3 mb-4 animate-in slide-in-from-top-2">
                     <AlertTriangle className="shrink-0" />
                     <div>
                         <p className="font-bold">Crítico: Risco Elevado</p>
                         <p className="text-sm">O valor excede em mais de 20% o limite do cliente.</p>
                     </div>
                 </div>
             )}

             <div className="flex gap-4 mb-6">
                 <select 
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-lg bg-white"
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                 >
                     <option value="DINHEIRO">Dinheiro</option>
                     <option value="PIX">Pix</option>
                     <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                     <option value="CARTAO_DEBITO">Cartão de Débito</option>
                     <option value="FIADO">Fiado / A Prazo</option>
                     {cliente && creditoDisponivel > 0 && <option value="CREDITO">Saldo em Conta</option>}
                 </select>
                 <input 
                    type="number"
                    className="w-40 p-3 border border-gray-300 rounded-lg text-lg text-right"
                    placeholder="0,00"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                 />
                 <button 
                    className="bg-gray-900 text-white px-6 rounded-lg font-bold hover:bg-black"
                    onClick={handleAddPagamento}
                    disabled={restante <= 0 || (metodo === 'FIADO' && !cliente?.id)}
                 >
                    Adicionar
                 </button>
             </div>

             {/* Warning message when FIADO selected without client */}
             {metodo === 'FIADO' && (!cliente || !cliente.id) && (
                 <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-sm animate-in fade-in">
                     <AlertTriangle size={18} />
                     <span>Selecione um cliente acima para vender Fiado</span>
                 </div>
             )}

             <div className="flex-1 overflow-y-auto mb-6">
                 <table className="w-full text-left">
                     <thead className="text-sm text-gray-500 border-b border-gray-100">
                         <tr>
                             <th className="pb-2">Método</th>
                             <th className="pb-2 text-right">Valor</th>
                             <th className="w-10"></th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {pagamentos.map((pag, idx) => (
                             <tr key={idx}>
                                 <td className="py-3 font-medium text-gray-700">{pag.metodo}</td>
                                 <td className="py-3 text-right font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pag.valor)}
                                 </td>
                                 <td className="py-3 text-center">
                                     <button onClick={() => removePagamento(idx)} className="text-red-400 hover:text-red-600">
                                         <Trash2 size={16} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>

             <div className="mt-auto">
                 <div className="flex justify-between items-center mb-4 text-lg">
                     <span className="text-gray-500">Restante a Pagar</span>
                     <span className={`font-bold ${restante > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(restante)}
                     </span>
                 </div>
                 
             {/* Change Handling - New UI */}
             {restante <= 0 && troco > 0 && (
                 <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-blue-900">Troco: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(troco)}</span>
                     </div>
                     
                     <div className="bg-white p-3 rounded-lg border border-blue-100">
                         <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Destino do Troco</h4>
                         <div className="space-y-2">
                             <label className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-colors ${destinoTroco === 'DINHEIRO' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                 <input 
                                     type="radio" 
                                     name="destinoTroco" 
                                     value="DINHEIRO"
                                     checked={destinoTroco === 'DINHEIRO'}
                                     onChange={() => setDestinoTroco('DINHEIRO')}
                                     className="text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="font-medium text-gray-700">💵 Devolver em Dinheiro</span>
                             </label>
                             <label className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-colors ${destinoTroco === 'PIX' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                 <input 
                                     type="radio" 
                                     name="destinoTroco" 
                                     value="PIX"
                                     checked={destinoTroco === 'PIX'}
                                     onChange={() => setDestinoTroco('PIX')}
                                     className="text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="font-medium text-gray-700">📱 Enviar PIX</span>
                             </label>
                             {cliente && (
                                <label className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-colors ${destinoTroco === 'CREDITO' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="destinoTroco" 
                                        value="CREDITO"
                                        checked={destinoTroco === 'CREDITO'}
                                        onChange={() => setDestinoTroco('CREDITO')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">💰 Salvar como Crédito</span>
                                </label>
                             )}
                         </div>
                     </div>
                 </div>
             )}

                 <button 
                    className="w-full py-4 bg-emerald-600 text-white text-xl font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                    onClick={handleFinalizar}
                    disabled={restante > 0.01}
                 >
                    CONFIRMAR VENDA
                 </button>
             </div>
        </div>

      </div>
    </div>
  )
}
