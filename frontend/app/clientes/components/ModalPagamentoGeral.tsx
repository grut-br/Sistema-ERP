"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, DollarSign, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react"

interface ModalPagamentoGeralProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clienteId: number | null
  totalDevido: number
}

export function ModalPagamentoGeral({ isOpen, onClose, onSuccess, clienteId, totalDevido }: ModalPagamentoGeralProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResultado, setShowResultado] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    valorPagamento: "",
    metodoPagamento: "PIX",
  })

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        valorPagamento: totalDevido.toFixed(2),
        metodoPagamento: "PIX",
      })
      setShowResultado(false)
      setResultado(null)
    }
  }, [isOpen, totalDevido])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clienteId) return

    const valorPagamento = parseFloat(formData.valorPagamento)
    
    if (isNaN(valorPagamento) || valorPagamento <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido maior que zero.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/clientes/${clienteId}/pendencias/pagar-todas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valorPagamento: valorPagamento,
          metodoPagamento: formData.metodoPagamento,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar pagamento')
      }

      const result = await response.json()
      setResultado(result)
      setShowResultado(true)
      
      // Aguarda 3 segundos antes de fechar e recarregar
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: error.message,
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  return (
    <div className="modal-overlay" style={{zIndex: 60}}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="flex items-center gap-1">
            <DollarSign size={24} className="text-green-600" />
            Pagar Todas as Dívidas
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!showResultado ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                  <AlertCircle size={18} />
                  <span className="font-semibold">Total a Pagar</span>
                </div>
                <p className="text-3xl font-bold text-amber-800">{formatCurrency(totalDevido)}</p>
                <p className="text-sm text-amber-600 mt-2">
                  O valor será distribuído automaticamente entre todas as dívidas (da mais antiga para a mais nova)
                </p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="valorPagamento">Valor do Pagamento *</label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <span className="bg-gray-100 px-3 py-2 text-gray-500 border-r">R$</span>
                <input
                  type="number"
                  id="valorPagamento"
                  name="valorPagamento"
                  value={formData.valorPagamento}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border-0 focus:ring-0 focus:outline-none"
                  style={{ border: 'none', boxShadow: 'none' }}
                  step="0.01"
                  min="0.01"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => setFormData(prev => ({ ...prev, valorPagamento: totalDevido.toFixed(2) }))}
                >
                  Total ({formatCurrency(totalDevido)})
                </button>
                <button 
                  type="button" 
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => setFormData(prev => ({ ...prev, valorPagamento: (totalDevido / 2).toFixed(2) }))}
                >
                  Metade ({formatCurrency(totalDevido / 2)})
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="metodoPagamento">Método de Pagamento *</label>
              <select 
                id="metodoPagamento"
                name="metodoPagamento"
                value={formData.metodoPagamento} 
                onChange={handleChange}
                className="w-full"
              >
                <option value="DINHEIRO">💵 Dinheiro</option>
                <option value="PIX">📱 PIX</option>
                <option value="CARTAO">💳 Cartão</option>
                <option value="TRANSFERENCIA">🏦 Transferência</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6"> {/* Adicionei flex e gap para separar os botões */}
              <button 
                  type="button" 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" // Estilizei o Cancelar também
                  onClick={onClose}
              >
                  Cancelar
              </button>
              
              <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50" // Adicionei px-4 py-2
                  disabled={isSubmitting}
              >
                  {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
              </button>
          </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <CheckCircle2 size={48} className="mx-auto mb-2 text-green-600" />
              <h3 className="text-xl font-semibold text-green-800 mb-1">
                Pagamento Processado!
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(resultado?.valorPago || 0)}
              </p>
            </div>

            {resultado?.dividasQuitadas && resultado.dividasQuitadas.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  Dívidas Quitadas ({resultado.dividasQuitadas.length})
                </h4>
                <div className="space-y-2">
                  {resultado.dividasQuitadas.map((divida: any) => (
                    <div key={divida.id} className="flex justify-between text-sm bg-green-50 p-2 rounded">
                      <span className="text-gray-700">{divida.descricao}</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(divida.valorPago)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultado?.dividasParciais && resultado.dividasParciais.length > 0 && (
              <div className="bg-white border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <TrendingDown size={16} className="text-amber-600" />
                  Dívidas Parcialmente Pagas ({resultado.dividasParciais.length})
                </h4>
                <div className="space-y-2">
                  {resultado.dividasParciais.map((divida: any) => (
                    <div key={divida.id} className="text-sm bg-amber-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-700">{divida.descricao}</span>
                        <span className="font-semibold text-amber-700">
                          {formatCurrency(divida.valorPago)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        Restam {formatCurrency(divida.saldoRestante)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultado?.creditoGerado && resultado.creditoGerado > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💰 Crédito gerado: {formatCurrency(resultado.creditoGerado)}
                </p>
              </div>
            )}

            <p className="text-center text-sm text-gray-500">
              Fechando automaticamente...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
