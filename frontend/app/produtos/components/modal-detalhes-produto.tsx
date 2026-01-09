import { X, Pencil, Trash2, Camera } from "lucide-react"

interface ModalDetalhesProdutoProps {
  isOpen: boolean
  onClose: () => void
  produto: any
  onEdit: (produto: any) => void
  onDelete: (produto: any) => void
}

export function ModalDetalhesProduto({ isOpen, onClose, produto, onEdit, onDelete }: ModalDetalhesProdutoProps) {
  if (!isOpen || !produto) return null

  // Helper for currency
  const formatMoney = (val: any) => {
     const num = Number(val)
     return isNaN(num) ? "R$ 0,00" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
  }

  // Determine status color
  const statusColor = produto.status === 'INATIVO' ? 'text-gray-500 bg-gray-100' : 'text-green-700 bg-green-100'

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Added 'large' class to match Edit Modal width */}
      <div className="modal-content large !p-0" onClick={e => e.stopPropagation()}>
        
        {/* Header - Keeping it darker to distinguish 'View' from 'Edit' mode */}
        <div className="bg-slate-700 text-white p-6 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-bold">Detalhes do Produto</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-8 space-y-6">
            
            {/* ROW 1: Nome and Barcode */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Produto</label>
                     <h1 className="text-2xl font-bold text-gray-800">{produto.nome}</h1>
                </div>
                <div className="col-span-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Código de Barras</label>
                    <div className="bg-gray-100 p-2 rounded border border-gray-200 font-mono text-gray-700 text-sm">
                        {produto.codigoBarras || "Sem código"}
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ROW 2: Main Info + Image Placeholder */}
            <div className="grid grid-cols-12 gap-6">
                
                {/* Left Block: Info */}
                <div className="col-span-8 grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Categoria</label>
                        <p className="text-base font-medium text-gray-700">
                             {produto.categoria?.nome || produto.categoria || "—"}
                        </p>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fabricante</label>
                         <p className="text-base font-medium text-gray-700">
                             {produto.fabricante?.nome || "—"}
                         </p>
                    </div>

                     <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                         <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusColor}`}>
                             {produto.status || "ATIVO"}
                         </span>
                    </div>
                </div>

                {/* Right Block: Image Placeholder (Read Only) */}
                <div className="col-span-4">
                    <div className="aspect-video w-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                        <Camera size={40} className="text-gray-300" />
                    </div>
                   {/* If image existed, we would render <img ... /> here */}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ROW 3: Prices & Stock */}
            <div className="grid grid-cols-12 gap-6">
                 <div className="col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Preço de Venda</label>
                    <p className="text-2xl font-bold text-emerald-600">
                        {formatMoney(produto.precoVenda || produto.preco)}
                    </p>
                 </div>

                 <div className="col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Custo Médio</label>
                    <p className="text-lg font-medium text-gray-600">
                        {formatMoney(produto.precoCusto)}
                    </p>
                 </div>

                 <div className="col-span-3">
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Estoque Atual</label>
                     <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${Number(produto.estoque) > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {produto.estoque || 0}
                        </span>
                        <span className="text-xs text-gray-400">
                            (Mín: {produto.estoqueMinimo || 0})
                        </span>
                     </div>
                 </div>
            </div>

            {/* ROW 4: Description */}
            {produto.descricao && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descrição</label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {produto.descricao}
                    </p>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 rounded-b-xl border-t flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
            >
                Fechar
            </button>
            
            <button 
                onClick={() => { onClose(); onEdit(produto); }}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
                <Pencil size={18} />
                Editar
            </button>
            
            <button 
                onClick={() => { onClose(); onDelete(produto); }}
                className="px-5 py-2.5 bg-red-50 text-red-600 font-medium hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 border border-red-200"
            >
                <Trash2 size={18} />
                Excluir
            </button>
        </div>

      </div>
    </div>
  )
}
