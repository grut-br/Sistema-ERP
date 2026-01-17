import { X, Pencil, Trash2, Package } from "lucide-react"

interface ModalDetalhesKitProps {
  isOpen: boolean
  onClose: () => void
  kit: any
  onEdit: (kit: any) => void
  onDelete: (kit: any) => void
}

export function ModalDetalhesKit({ isOpen, onClose, kit, onEdit, onDelete }: ModalDetalhesKitProps) {
  if (!isOpen || !kit) return null

  // Helper for currency
  const formatMoney = (val: any) => {
     const num = Number(val)
     return isNaN(num) ? "R$ 0,00" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
  }

  // Calculate Values
  const componentes = kit.componentes || []
  
  // Valor da Venda (Sale Price of the Kit)
  const valorVenda = Number(kit.precoVenda) || 0
  
  // Valor Original dos Produtos (Sum of original selling prices * quantity)
  const valorOriginalProdutos = componentes.reduce((sum: number, c: any) => {
    const preco = Number(c.produto?.precoVenda || 0)
    const qtd = Number(c.quantidade || 0)
    return sum + (preco * qtd)
  }, 0)
  
  // Valor de Custo (Sum of average cost * quantity)
  const valorCusto = componentes.reduce((sum: number, c: any) => {
    const custo = Number(c.produto?.precoCusto || 0)
    const qtd = Number(c.quantidade || 0)
    return sum + (custo * qtd)
  }, 0)
  
  // Margem de Lucro (Profit Margin %)
  const margemLucro = valorVenda > 0 ? ((valorVenda - valorCusto) / valorVenda) * 100 : 0

  // Discount from original
  const desconto = valorOriginalProdutos - valorVenda

  // Status color
  const statusColor = kit.status === 'INATIVO' ? 'text-gray-500 bg-gray-100' : 'text-green-700 bg-green-100'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large !p-0" onClick={e => e.stopPropagation()}>
        
        {/* Header - Green to match table headers */}
        <div className="bg-emerald-500 text-white p-6 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Package size={28} />
                <h2 className="text-xl font-bold">Informações do Kit / Combo</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-8 space-y-6">
            
            {/* ROW 1: Nome and Status */}
            <div className="flex justify-between items-start">
                <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Kit</label>
                     <h1 className="text-2xl font-bold text-gray-800">{kit.nome}</h1>
                </div>
                <div className="text-right">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${statusColor}`}>
                        {kit.status || "ATIVO"}
                    </span>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ROW 2: Components List */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                        Produtos: {componentes.length.toString().padStart(2, '0')}
                    </label>
                </div>
                
                {componentes.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-400 italic">
                        Nenhum produto neste kit
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
                        {componentes.map((c: any, index: number) => (
                            <div key={index} className="flex items-center gap-4 p-4">
                                {/* Product Image Placeholder */}
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {c.produto?.urlImagem ? (
                                        <img src={c.produto.urlImagem} alt={c.produto.nome} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Package size={20} className="text-gray-400" />
                                    )}
                                </div>
                                
                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{c.produto?.nome || "Produto"}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatMoney(c.produto?.precoVenda || 0)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Quantidade: {c.quantidade?.toString().padStart(2, '0') || "01"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* ROW 3: Values Section */}
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Valores</label>
                
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 space-y-4">
                    
                    {/* Valor da Venda */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Valor da Venda</span>
                        <span className="text-xl font-bold text-emerald-600">{formatMoney(valorVenda)}</span>
                    </div>
                    
                    {/* Valor de Custo */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Valor de Custo</span>
                        <span className="text-lg font-semibold text-gray-700">{formatMoney(valorCusto)}</span>
                    </div>
                    
                    {/* Margem de Lucro */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Margem de Lucro</span>
                        <span className={`text-lg font-bold ${margemLucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {margemLucro.toFixed(1)}%
                        </span>
                    </div>
                    
                    <hr className="border-purple-100" />
                    
                    {/* Valor Original dos Produtos */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Valor Original dos Produtos</span>
                        <span className="text-gray-500 line-through">{formatMoney(valorOriginalProdutos)}</span>
                    </div>
                    
                    {/* Desconto */}
                    {desconto > 0 && (
                        <div className="flex justify-between items-center bg-green-50 -mx-6 px-6 py-3 -mb-6 rounded-b-xl">
                            <span className="text-green-700 font-medium">Economia para o Cliente</span>
                            <span className="text-green-700 font-bold">{formatMoney(desconto)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Estoque Virtual */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-1">Estoque Virtual</label>
                    <p className="text-2xl font-bold text-blue-600">
                        {kit.estoque || 0} <span className="text-sm font-medium text-blue-400">conjuntos</span>
                    </p>
                    <p className="text-xs text-blue-400 mt-1">Baseado no estoque dos componentes</p>
                </div>
                
                {kit.codigoBarras && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Código de Barras</label>
                        <p className="font-mono text-gray-700">{kit.codigoBarras}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 rounded-b-xl border-t flex justify-end gap-3">
            
            <button 
                onClick={() => { onClose(); onEdit(kit); }}
                className="px-5 py-2.5 bg-blue-500 text-white font-medium hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
                <Pencil size={18} />
                Editar
            </button>
            
            <button 
                onClick={() => { onClose(); onDelete(kit); }}
                className="px-5 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
                <Trash2 size={18} />
                Excluir
            </button>
             <button 
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
            >
                Fechar
            </button>
        </div>

      </div>
    </div>
  )
}
