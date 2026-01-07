"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, DollarSign } from "lucide-react"

interface ModalRecebimentoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  pendencia: {
    id: number
    descricao: string
    valor: number
    valorPago?: number
  } | null
}

export function ModalRecebimento({ isOpen, onClose, onSuccess, pendencia }: ModalRecebimentoProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    valorPago: "",
    formaPagamento: "PIX",
  })

  // Calculate values
  const valor = pendencia ? parseFloat(String(pendencia.valor)) : 0
  const valorPago = pendencia ? parseFloat(String(pendencia.valorPago || 0)) : 0
  const saldoRestante = valor - valorPago

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && pendencia) {
      setFormData({
        valorPago: saldoRestante.toFixed(2),
        formaPagamento: "PIX",
      })
    }
  }, [isOpen, pendencia, saldoRestante])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pendencia) return

    const valorPagar = parseFloat(formData.valorPago)
    
    if (isNaN(valorPagar) || valorPagar <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido maior que zero.",
        variant: "destructive"
      })
      return
    }

    if (valorPagar > saldoRestante + 0.01) {
      toast({
        title: "Erro",
        description: `Valor excede o saldo restante (R$ ${saldoRestante.toFixed(2)})`,
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/financeiro/${pendencia.id}/pagar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valorPago: valorPagar,
          formaPagamento: formData.formaPagamento,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao registrar pagamento')
      }

      const resultado = await response.json()
      const isQuitado = valorPagar >= saldoRestante - 0.01

      toast({ 
        title: "Sucesso", 
        description: resultado.mensagem || (isQuitado 
          ? "Dívida quitada com sucesso!" 
          : `Pagamento parcial de R$ ${valorPagar.toFixed(2)} recebido!`),
        variant: "default"
      })
      
      onSuccess()
      onClose()
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

  if (!isOpen || !pendencia) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  return (
    <div className="modal-overlay" style={{zIndex: 60}}>
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <h2 className="flex items-center gap-2">
            <DollarSign size={24} className="text-green-600" />
            Receber Pagamento
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              {pendencia.descricao}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Total:</span>
                <span className="font-semibold">{formatCurrency(valor)}</span>
              </div>
              {valorPago > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Já Pago:</span>
                  <span className="font-semibold">{formatCurrency(valorPago)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-semibold">Saldo Restante:</span>
                <span className="font-bold text-green-600">{formatCurrency(saldoRestante)}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="valorPago">Valor a Pagar *</label>
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <span className="bg-gray-100 px-3 py-2 text-gray-500 border-r">R$</span>
              <input
                type="number"
                id="valorPago"
                name="valorPago"
                value={formData.valorPago}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border-0 focus:ring-0 focus:outline-none"
                style={{ border: 'none', boxShadow: 'none' }}
                step="0.01"
                min="0.01"
                max={saldoRestante}
                autoFocus
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                type="button" 
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => setFormData(prev => ({ ...prev, valorPago: saldoRestante.toFixed(2) }))}
              >
                Valor Total
              </button>
              <button 
                type="button" 
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => setFormData(prev => ({ ...prev, valorPago: (saldoRestante / 2).toFixed(2) }))}
              >
                Metade
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="formaPagamento">Método de Pagamento *</label>
            <select 
              id="formaPagamento"
              name="formaPagamento"
              value={formData.formaPagamento} 
              onChange={handleChange}
              className="w-full"
            >
              <option value="DINHEIRO">💵 Dinheiro</option>
              <option value="PIX">📱 PIX</option>
              <option value="CARTAO">💳 Cartão</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit bg-green-600 hover:bg-green-700 text-white shadow-sm" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processando..." : "Confirmar Recebimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
