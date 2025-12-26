"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import "./modal-new-categoria.css"

interface ModalNovaCategoriaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalNovaCategoria({ isOpen, onClose, onSuccess }: ModalNovaCategoriaProps) {
  const [nome, setNome] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      })

      if (!response.ok) throw new Error('Falha ao criar categoria')

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      })

      setNome("") // Limpa o campo
      onSuccess() // Avisa o pai que salvou
      onClose() // Fecha o modal
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
  <div className="modal-content modal-sm">
    
    {/* HEADER */}
    <div className="modal-header">
      <h2>Nova Categoria</h2>
      <button className="close-btn" onClick={onClose}>
        <X size={18} />
      </button>
    </div>

    {/* BODY */}
    <div className="modal-body">
      <label>Nome</label>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: Suplementos"
        autoFocus
      />
    </div>

    {/* FOOTER */}
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
