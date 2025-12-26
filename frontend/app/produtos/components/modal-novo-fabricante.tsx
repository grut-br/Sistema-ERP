"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import "./modal-new-categoria.css" // Reusing same styles

interface ModalNovoFabricanteProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalNovoFabricante({ isOpen, onClose, onSuccess }: ModalNovoFabricanteProps) {
  const [nome, setNome] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
      const response = await fetch('/api/fabricantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      })

      if (!response.ok) throw new Error('Falha ao criar fabricante')

      toast({
        title: "Sucesso",
        description: "Fabricante criado com sucesso!"
      })

      setNome("")
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Erro ao salvar fabricante.",
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
          <h2>Novo Fabricante</h2>
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
