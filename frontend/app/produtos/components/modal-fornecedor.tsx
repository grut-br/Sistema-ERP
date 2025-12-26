"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import "./modal-new-categoria.css" // Reutilizando os estilos do modal de categoria para manter consistência visual

interface ModalFornecedorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalFornecedor({ isOpen, onClose, onSuccess }: ModalFornecedorProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do fornecedor é obrigatório.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Falha ao criar fornecedor')

      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso!"
      })

      setFormData({ nome: "", cnpj: "", email: "", telefone: "" })
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-md" style={{ maxWidth: '500px' }}> {/* Um pouco mais largo que o de categoria */}
        
        <div className="modal-header">
          <h2>Novo Fornecedor</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-field" style={{ marginBottom: '12px' }}>
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Razão Social ou Nome Fantasia"
              autoFocus
            />
          </div>
          
          <div className="form-field" style={{ marginBottom: '12px' }}>
            <label>CNPJ</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="form-field">
              <label>Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  )
}
