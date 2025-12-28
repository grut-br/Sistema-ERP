"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import "./modal-new-categoria.css"

interface ModalNovoFabricanteProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (novoFabricante?: any) => void
  fabricanteParaEditar?: any // Support editing
}

export function ModalNovoFabricante({ isOpen, onClose, onSuccess, fabricanteParaEditar }: ModalNovoFabricanteProps) {
  const [nome, setNome] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Reset or pre-fill
  useEffect(() => {
    if (isOpen) {
        if (fabricanteParaEditar) {
            setNome(fabricanteParaEditar.nome || "")
        } else {
            setNome("")
        }
    }
  }, [isOpen, fabricanteParaEditar])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do fabricante é obrigatório.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const url = fabricanteParaEditar 
        ? `/api/fabricantes/${fabricanteParaEditar.id}`
        : '/api/fabricantes'
      
      const method = fabricanteParaEditar ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      })

      if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Falha ao salvar fabricante')
      }

      const savedData = await response.json() // Get created/updated object

      toast({
        title: "Sucesso",
        description: `Fabricante ${fabricanteParaEditar ? 'atualizado' : 'criado'} com sucesso!`
      })

      setNome("")
      onSuccess(savedData) // Pass back the object
      onClose()
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar fabricante.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-sm">
        <div className="modal-header">
          <h2>{fabricanteParaEditar ? "Editar Fabricante" : "Novo Fabricante"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Nike, Growth, etc"
            autoFocus
          />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            type="button" // Explicitly type button to avoid form submit assumption
            className="btn-primary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSave()
            }}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
