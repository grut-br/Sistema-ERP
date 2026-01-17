"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import "./modal-new-categoria.css"

interface ModalNovaCategoriaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (novaCategoria?: any) => void
  categoriaParaEditar?: { id: number, nome: string } | null
}

export function ModalNovaCategoria({ isOpen, onClose, onSuccess, categoriaParaEditar }: ModalNovaCategoriaProps) {
  const [nome, setNome] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Preencher nome ao abrir para edição
  // useEffect seria ideal, mas como o componente é condicionalmente montado ou o estado é resetado...
  // Vamos usar um useEffect que depende do isOpen e categoriaParaEditar
  const [initialLoad, setInitialLoad] = useState(false)

  if (isOpen && !initialLoad) {
     if (categoriaParaEditar) {
        setNome(categoriaParaEditar.nome)
     } else {
        setNome("")
     }
     setInitialLoad(true)
  }

  // Reset flag when closed
  if (!isOpen && initialLoad) {
    setInitialLoad(false)
  }
 
  // BETTER APPROACH: Use useEffect
  // We need to import useEffect first. I will assume it's imported or add it.
  // Actually, standard React pattern:
  /*
  useEffect(() => {
    if (isOpen) {
        setNome(categoriaParaEditar?.nome || "")
    }
  }, [isOpen, categoriaParaEditar])
  */
  
  // Since I am replacing the whole file content mostly, I will stick to the plan but I need to make sure I have useEffect.
  // The original file imported useState. I need to check imports.
  // Let's rewrite the component to be clean.

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
      const url = categoriaParaEditar 
        ? `/api/categorias/${categoriaParaEditar.id}`
        : '/api/categorias'
      
      const method = categoriaParaEditar ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      })

      if (!response.ok) throw new Error('Falha ao salvar categoria')

      const savedData = await response.json()

      toast({
        title: "Sucesso",
        description: categoriaParaEditar ? "Categoria atualizada!" : "Categoria criada!"
      })

      setNome("") 
      onSuccess(savedData) 
      onClose() 
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
          <h2>{categoriaParaEditar ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="form-field">
            <label>Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Suplementos"
              autoFocus
            />
          </div>
        </div>

        {/* FOOTER */}
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
            type="button"
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
