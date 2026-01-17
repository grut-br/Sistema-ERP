"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { formatCNPJ, formatPhone, cleanNonDigits } from "@/utils/masks"

interface ModalFornecedorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  fornecedorParaEditar?: any // Optional prop for editing
}

export function ModalFornecedor({ isOpen, onClose, onSuccess, fornecedorParaEditar }: ModalFornecedorProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Reset or Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (fornecedorParaEditar) {
        setFormData({
          nome: fornecedorParaEditar.nome || "",
          cnpj: formatCNPJ(fornecedorParaEditar.cnpj || ""),
          email: fornecedorParaEditar.email || "",
          telefone: formatPhone(fornecedorParaEditar.telefone || "")
        })
      } else {
        setFormData({
            nome: "",
            cnpj: "",
            email: "",
            telefone: ""
        })
      }
    }
  }, [isOpen, fornecedorParaEditar])

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
      // Clean data before sending
      const payload = {
        ...formData,
        cnpj: cleanNonDigits(formData.cnpj),
        telefone: cleanNonDigits(formData.telefone)
      }

      const url = fornecedorParaEditar 
        ? `/api/fornecedores/${fornecedorParaEditar.id}`
        : '/api/fornecedores'
      
      const method = fornecedorParaEditar ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha ao salvar fornecedor')
      }

      toast({
        title: "Sucesso",
        description: `Fornecedor ${fornecedorParaEditar ? 'atualizado' : 'criado'} com sucesso!`
      })

      setFormData({ nome: "", cnpj: "", email: "", telefone: "" })
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar fornecedor.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-md" style={{ maxWidth: '500px' }}>
        
        <div className="modal-header">
          <h2>{fornecedorParaEditar ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Razão Social ou Nome Fantasia"
              autoFocus
            />
          </div>
          
          <div className="form-field">
            <label>CNPJ</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: formatCNPJ(e.target.value)})}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>

          <div className="form-row">
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
                onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})}
                placeholder="(00) 00000-0000"
                maxLength={15}
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
