"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, DollarSign, Clock, CreditCard } from "lucide-react"

interface ModalPagamentoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lancamento: any | null
}

export function ModalPagamento({ isOpen, onClose, onSuccess, lancamento }: ModalPagamentoProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false)
  
  const [formData, setFormData] = useState({
    valorPago: "",
    formaPagamento: "DINHEIRO",
    observacao: "",
  })

  // Calculate values
  const valor = lancamento ? parseFloat(lancamento.valor) : 0
  const valorPago = lancamento ? parseFloat(lancamento.valorPago || 0) : 0
  const saldoRestante = valor - valorPago

  // Load historico when modal opens
  useEffect(() => {
    if (isOpen && lancamento?.id) {
      setFormData({
        valorPago: saldoRestante.toFixed(2),
        formaPagamento: "DINHEIRO",
        observacao: "",
      })
      fetchHistorico()
    }
  }, [isOpen, lancamento])

  const fetchHistorico = async () => {
    if (!lancamento?.id) return
    setIsLoadingHistorico(true)
    try {
      const response = await fetch(`/api/financeiro/lancamentos/${lancamento.id}/historico`)
      if (response.ok) {
        setHistorico(await response.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingHistorico(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const valorPagar = parseFloat(formData.valorPago)
    if (isNaN(valorPagar) || valorPagar <= 0) {
      toast({ title: "Erro", description: "Informe um valor válido.", variant: "destructive" })
      return
    }
    
    if (valorPagar > saldoRestante + 0.01) {
      toast({ title: "Erro", description: "Valor excede o saldo restante.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/financeiro/${lancamento.id}/pagar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valorPago: valorPagar,
          formaPagamento: formData.formaPagamento,
          observacao: formData.observacao || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao registrar pagamento')
      }

      const resultado = await response.json()
      
      toast({ 
        title: "Sucesso", 
        description: resultado.mensagem || "Pagamento registrado!"
      })
      
      if (resultado.proximoLancamento) {
        toast({ 
          title: "🔄 Recorrência", 
          description: `Novo lançamento criado: ${resultado.proximoLancamento.descricao}`,
        })
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(typeof value === 'string' ? parseFloat(value) : value)
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  if (!isOpen || !lancamento) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h2>Registrar Pagamento</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 uppercase">Valor Total</p>
            <p className="text-lg font-bold text-gray-700">{formatCurrency(valor)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-xs text-green-600 uppercase">Já Pago</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(valorPago)}</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${saldoRestante > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
            <p className={`text-xs uppercase ${saldoRestante > 0 ? 'text-amber-600' : 'text-green-600'}`}>Saldo Restante</p>
            <p className={`text-lg font-bold ${saldoRestante > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {formatCurrency(saldoRestante)}
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Descrição:</strong> {lancamento.descricao}
          </p>
          {lancamento.frequencia && lancamento.frequencia !== 'NENHUMA' && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <Clock size={12} />
              Recorrente ({lancamento.frequencia.toLowerCase()}) - Ao quitar, próximo será criado automaticamente
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Valor a Pagar *</label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <span className="bg-gray-100 px-3 py-2 text-gray-500 border-r">R$</span>
                <input
                  type="number"
                  name="valorPago"
                  value={formData.valorPago}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border-0 focus:ring-0 focus:outline-none"
                  style={{ border: 'none', boxShadow: 'none' }}
                  step="0.01"
                  min="0.01"
                  max={saldoRestante}
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
              <label>Forma de Pagamento</label>
              <select name="formaPagamento" value={formData.formaPagamento} onChange={handleChange}>
                <option value="DINHEIRO">💵 Dinheiro</option>
                <option value="PIX">📱 PIX</option>
                <option value="CARTAO">💳 Cartão</option>
                <option value="TRANSFERENCIA">🏦 Transferência</option>
                <option value="CREDITO">💰 Crédito da Loja</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Observação (opcional)</label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Ex: Pagamento referente a março"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Histórico de Pagamentos */}
          {historico.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <CreditCard size={14} />
                Histórico de Pagamentos
              </h4>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg">
                {historico.map((pag: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-0 text-sm">
                    <div>
                      <span className="font-medium text-green-600">{formatCurrency(pag.valor)}</span>
                      <span className="text-gray-400 ml-2 text-xs">{pag.formaPagamento}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDateTime(pag.dataPagamento)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : `Pagar ${formatCurrency(parseFloat(formData.valorPago) || 0)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
