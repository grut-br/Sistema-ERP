import { createPortal } from "react-dom"
import { Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface ActionMenuProps {
  isOpen: boolean
  onClose: () => void
  position: { top: number, left: number }
  onEdit: () => void
  onDelete: () => void
}

export const ActionMenu = ({ isOpen, onClose, position, onEdit, onDelete }: ActionMenuProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 9998,
          cursor: 'default' 
        }} 
        onClick={onClose}
      />
      <div 
        className="action-menu"
        style={{ 
          position: 'fixed', 
          top: position.top, 
          left: position.left, 
          zIndex: 9999,
          minWidth: '180px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => { onEdit(); onClose(); }}>
          <Pencil size={16} /> Visualizar/Editar
        </button>
        <button className="delete" onClick={() => { onDelete(); onClose(); }}>
          <Trash2 size={16} /> Excluir
        </button>
      </div>
    </>,
    document.body
  )
}
