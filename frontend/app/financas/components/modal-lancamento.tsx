"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Link2, AlertTriangle } from "lucide-react"

interface ModalLancamentoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categorias: any[]
  lancamentoParaEditar?: any | null
}

export function ModalLancamento({ isOpen, onClose, onSuccess, categorias, lancamentoParaEditar }: ModalLancamentoProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "DESPESA",
    dataVencimento: "",
    idCategoria: "",
    frequencia: "NENHUMA",
  })

  // Verifica se é um lançamento vinculado (fiado ou compra)
  const isVinculado = lancamentoParaEditar && (lancamentoParaEditar.idVenda || lancamentoParaEditar.idCompra)
  const tipoVinculo = lancamentoParaEditar?.idVenda 
    ? "Fiado (Venda)" 
    : lancamentoParaEditar?.idCompra 
      ? "Compra de Fornecedor" 
      : null

  // Reset form when modal opens/closes or lancamentoParaEditar changes
  useEffect(() => {
    if (isOpen) {
      if (lancamentoParaEditar) {
        setFormData({
          descricao: lancamentoParaEditar.descricao || "",
          valor: String(lancamentoParaEditar.valor || ""),
          tipo: lancamentoParaEditar.tipo || "DESPESA",
          dataVencimento: lancamentoParaEditar.dataVencimento || "",
          idCategoria: lancamentoParaEditar.idCategoria ? String(lancamentoParaEditar.idCategoria) : "",
          frequencia: lancamentoParaEditar.frequencia || "NENHUMA",
        })
      } else {
        setFormData({
          descricao: "",
          valor: "",
          tipo: "DESPESA",
          dataVencimento: "",
          idCategoria: "",
          frequencia: "NENHUMA",
        })
      }
    }
  }, [isOpen, lancamentoParaEditar])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Quando muda o tipo, limpa a categoria selecionada
    if (name === 'tipo') {
      setFormData(prev => ({ ...prev, [name]: value, idCategoria: "" }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descricao || !formData.valor || !formData.tipo) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const url = lancamentoParaEditar 
        ? `/api/financeiro/${lancamentoParaEditar.id}`
        : '/api/financeiro'
      
      // Se for vinculado, só envia os campos editáveis
      let payload: any
      if (isVinculado) {
        payload = {
          idCategoria: formData.idCategoria ? parseInt(formData.idCategoria) : null,
        }
        // Só envia data se tiver valor válido
        if (formData.dataVencimento) {
          payload.dataVencimento = formData.dataVencimento
        }
      } else {
        payload = {
          ...formData,
          valor: parseFloat(formData.valor),
          idCategoria: formData.idCategoria ? parseInt(formData.idCategoria) : null,
        }
      }

      const response = await fetch(url, {
        method: lancamentoParaEditar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar lançamento')
      }

      toast({ 
        title: "Sucesso", 
        description: lancamentoParaEditar ? "Lançamento atualizado!" : "Lançamento criado!"
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Filter categories by selected type
  const filteredCategorias = categorias.filter(c => c.tipo === formData.tipo)

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{lancamentoParaEditar ? "Editar Lançamento" : "Novo Lançamento"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Aviso de lançamento vinculado */}
        {isVinculado && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Link2 size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Lançamento vinculado: {tipoVinculo}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Alguns campos não podem ser alterados pois os valores vêm do registro original.
                Apenas Data de Vencimento e Categoria podem ser modificados.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição *</label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ex: Aluguel Janeiro"
              disabled={isVinculado}
              className={isVinculado ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo *</label>
              <select 
                name="tipo" 
                value={formData.tipo} 
                onChange={handleChange}
                disabled={isVinculado}
                className={isVinculado ? "bg-gray-100 cursor-not-allowed" : ""}
              >
                <option value="DESPESA">Despesa</option>
                <option value="RECEITA">Receita</option>
              </select>
            </div>
            <div className="form-group">
              <label>Valor *</label>
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                disabled={isVinculado}
                className={isVinculado ? "bg-gray-100 cursor-not-allowed" : ""}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de Vencimento</label>
              <input
                type="date"
                name="dataVencimento"
                value={formData.dataVencimento}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select name="idCategoria" value={formData.idCategoria} onChange={handleChange}>
                <option value="">Sem categoria</option>
                {filteredCategorias.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Recorrência</label>
            <select 
              name="frequencia" 
              value={formData.frequencia} 
              onChange={handleChange}
              disabled={isVinculado}
              className={isVinculado ? "bg-gray-100 cursor-not-allowed" : ""}
            >
              <option value="NENHUMA">Sem recorrência</option>
              <option value="SEMANAL">Semanal</option>
              <option value="MENSAL">Mensal</option>
              <option value="ANUAL">Anual</option>
            </select>
            {formData.frequencia !== "NENHUMA" && !isVinculado && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Ao pagar este lançamento, um novo será criado automaticamente para o próximo período.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : (lancamentoParaEditar ? "Atualizar" : "Criar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
