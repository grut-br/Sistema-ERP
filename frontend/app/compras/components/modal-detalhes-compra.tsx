import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { format } from "date-fns"

interface ModalDetalhesCompraProps {
  isOpen: boolean
  onClose: () => void
  compraId: number | null
}

export function ModalDetalhesCompra({ isOpen, onClose, compraId }: ModalDetalhesCompraProps) {
  const [compra, setCompra] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && compraId) {
      fetchDetalhes()
    } else {
        setCompra(null)
    }
  }, [isOpen, compraId])

  const fetchDetalhes = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/compras/${compraId}`)
      if (res.ok) {
        setCompra(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header - Green to match table headers */}
        <div className="bg-emerald-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Detalhes da Entrada #{compraId}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
             <div className="text-center py-10 text-gray-500">Carregando detalhes...</div>
          ) : !compra ? (
             <div className="text-center py-10 text-gray-500">Erro ao carregar ou entrada não encontrada.</div>
          ) : (
            <div className="flex flex-col gap-6">
                
                {/* Header Info */}
                <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border">
                    <div>
                        <span className="block text-xs font-bold text-gray-500 uppercase">Fornecedor</span>
                        <span className="block text-sm">{compra.fornecedor?.nome || "-"}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-500 uppercase">Nota Fiscal</span>
                        <span className="block text-sm">{compra.notaFiscal || "-"}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-500 uppercase">Data</span>
                        <span className="block text-sm">{compra.dataCompra ? format(new Date(compra.dataCompra), 'dd/MM/yyyy') : "-"}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-500 uppercase">Total Nota</span>
                        <span className="block text-sm font-bold text-green-600">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(compra.valorTotal || 0)}
                        </span>
                    </div>
                    {compra.observacoes && (
                        <div className="col-span-4 border-t pt-2 mt-2">
                             <span className="block text-xs font-bold text-gray-500 uppercase">Observações</span>
                             <p className="text-sm text-gray-700 whitespace-pre-wrap">{compra.observacoes}</p>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div>
                    <h3 className="font-semibold mb-2">Itens da Nota</h3>
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-3">Produto</th>
                                    <th className="p-3 text-center">Qtd</th>
                                    <th className="p-3 text-right">Custo Uni.</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                    <th className="p-3 text-center">Validade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {compra.itens?.map((item: any, idx: number) => (
                                    <tr key={item.id || idx}>
                                        <td className="p-3">{item.produto?.nome || `Produto #${item.idProduto}`}</td>
                                        <td className="p-3 text-center">{item.quantidade}</td>
                                        <td className="p-3 text-right">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.custoUnitario || 0)}
                                        </td>
                                        <td className="p-3 text-right">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((item.custoUnitario * item.quantidade) || 0)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {item.validade ? format(new Date(item.validade), 'dd/MM/yyyy') : "-"}
                                        </td>
                                    </tr>
                                ))}
                                {(!compra.itens || compra.itens.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">Nenhum item registrado nesta compra.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
                Fechar
            </button>
        </div>

      </div>
    </div>
  )
}
