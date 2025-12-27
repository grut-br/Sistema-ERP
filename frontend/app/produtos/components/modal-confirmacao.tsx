"use client"

import { X, AlertTriangle } from "lucide-react"

interface ModalConfirmacaoProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  mensagem: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
}

export function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensagem,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'danger',
  isLoading = false
}: ModalConfirmacaoProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center gap-3 border-b ${variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
          <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <h2 className={`text-lg font-semibold ${variant === 'danger' ? 'text-red-900' : 'text-amber-900'}`}>
            {titulo}
          </h2>
          <button 
            onClick={onClose} 
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {mensagem}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2
              ${variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500'
              }`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
