"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface ModalCategoriaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categoriaParaEditar?: any | null
}

const CORES_SUGERIDAS = [
  { cor: "#22C55E", nome: "Verde" },
  { cor: "#3B82F6", nome: "Azul" },
  { cor: "#EF4444", nome: "Vermelho" },
  { cor: "#F97316", nome: "Laranja" },
  { cor: "#8B5CF6", nome: "Roxo" },
  { cor: "#06B6D4", nome: "Ciano" },
  { cor: "#EC4899", nome: "Rosa" },
  { cor: "#FACC15", nome: "Amarelo" },
  { cor: "#6B7280", nome: "Cinza" },
]

export function ModalCategoria({ isOpen, onClose, onSuccess, categoriaParaEditar }: ModalCategoriaProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "DESPESA",
    cor: "#6B7280",
  })

  // Reset form when modal opens/closes or edit data changes
  useEffect(() => {
    if (categoriaParaEditar) {
      setFormData({
        nome: categoriaParaEditar.nome || "",
        tipo: categoriaParaEditar.tipo || "DESPESA",
        cor: categoriaParaEditar.cor || "#6B7280",
      })
    } else {
      setFormData({
        nome: "",
        tipo: "DESPESA",
        cor: "#6B7280",
      })
    }
  }, [categoriaParaEditar, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.tipo) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const url = categoriaParaEditar 
        ? `/api/financeiro/categorias/${categoriaParaEditar.id}`
        : '/api/financeiro/categorias'
      
      const response = await fetch(url, {
        method: categoriaParaEditar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar categoria')
      }

      toast({ 
        title: "Sucesso", 
        description: categoriaParaEditar ? "Categoria atualizada!" : "Categoria criada!"
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

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2>{categoriaParaEditar ? "Editar Categoria" : "Nova Categoria"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Energia Elétrica"
            />
          </div>

          <div className="form-group">
            <label>Tipo *</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange}>
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>

          <div className="form-group">
            <label>Cor</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                className="w-12 h-10 cursor-pointer rounded border"
              />
              <div className="flex gap-2 flex-wrap">
                {CORES_SUGERIDAS.map(({ cor, nome }) => (
                  <button
                    key={cor}
                    type="button"
                    title={nome}
                    onClick={() => setFormData(prev => ({ ...prev, cor }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      formData.cor === cor ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Pré-visualização</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: formData.cor }}
              />
              <span className="text-sm font-medium text-gray-700">
                {formData.nome || "Nome da categoria"}
              </span>
              <span className={`ml-auto text-xs px-2 py-1 rounded ${
                formData.tipo === 'RECEITA' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {formData.tipo}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : (categoriaParaEditar ? "Atualizar" : "Criar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
