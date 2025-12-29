import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface ModalNovaEntradaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ItemCarrinho {
  idProduto: number
  nomeProduto: string
  quantidade: number
  custoUnitario: number
  validade: string
}

export const ModalNovaEntrada = ({ isOpen, onClose, onSuccess }: ModalNovaEntradaProps) => {
  const { toast } = useToast()

  // Data Lists
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])

  // Header State
  const [idFornecedor, setIdFornecedor] = useState("")
  const [numeroNota, setNumeroNota] = useState("")
  const [dataEmissao, setDataEmissao] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [observacoes, setObservacoes] = useState("")
  
  // Item Form State
  const [itemForm, setItemForm] = useState({
    idProduto: "",
    quantidade: "",
    custoUnitario: "",
    validade: ""
  })
  
  // Cart State
  const [itens, setItens] = useState<ItemCarrinho[]>([])

  // Validation State
  const [errors, setErrors] = useState({
      fornecedor: false,
      numeroNota: false,
      dataEmissao: false,
      itemProduto: false,
      itemQtd: false,
      itemCusto: false,
      itemValidade: false,
  })

  // Product Search
  const [produtoSearchInfo, setProdutoSearchInfo] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchFornecedores()
      fetchProdutos()
      resetForm()
    }
  }, [isOpen])

  const fetchFornecedores = async () => {
    try {
      const res = await fetch('/api/fornecedores')
      if (res.ok) setFornecedores(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const fetchProdutos = async () => {
    try {
      const res = await fetch('/api/produtos')
      if (res.ok) setProdutos(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const resetForm = () => {
    setIdFornecedor("")
    setNumeroNota("")
    setDataEmissao(format(new Date(), 'yyyy-MM-dd'))
    setObservacoes("")
    setItens([])
    resetItemForm()
  }

  const resetItemForm = () => {
    setItemForm({
      idProduto: "",
      quantidade: "",
      custoUnitario: "",
      validade: ""
    })
    setProdutoSearchInfo("")
  }

  const handleAddItem = () => {
    // Validation
    const newErrors = {
        ...errors,
        itemProduto: !itemForm.idProduto,
        itemQtd: !itemForm.quantidade,
        itemCusto: !itemForm.custoUnitario,
        itemValidade: !itemForm.validade
    }
    
    if (newErrors.itemProduto || newErrors.itemQtd || newErrors.itemCusto || newErrors.itemValidade) {
        setErrors(newErrors)
        toast({ title: "Erro", description: "Preencha todos os campos do item.", variant: "destructive" })
        return
    }

    const produtoSelected = produtos.find(p => p.id === Number(itemForm.idProduto))
    if (!produtoSelected) return

    const novoItem: ItemCarrinho = {
      idProduto: Number(itemForm.idProduto),
      nomeProduto: produtoSelected.nome,
      quantidade: Number(itemForm.quantidade),
      custoUnitario: Number(itemForm.custoUnitario.replace(',', '.')),
      validade: itemForm.validade
    }

    setItens([...itens, novoItem])
    resetItemForm()
    
    // Clear item errors
    setErrors({
        ...errors,
        itemProduto: false,
        itemQtd: false,
        itemCusto: false,
        itemValidade: false
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItens = [...itens]
    newItens.splice(index, 1)
    setItens(newItens)
  }

  const handleFinalizar = async () => {
    // Debug Log requested by user
    console.log("PAYLOAD DEBUG:", {
        fornecedorSelecionado: idFornecedor, 
        itens: itens,
        payloadFinal: {
            idFornecedor: Number(idFornecedor), // Correct key based on usecase
            notaFiscal: numeroNota, // Correct key based on usecase 'notaFiscal: numeroNota' param mapping or direct prop? 
                                    // UseCase execute(dados) destructures: { idFornecedor, dataCompra, itens, numeroNota, observacoes }
                                    // Actually, execute({ idFornecedor, dataCompra, itens, numeroNota, observacoes })
            numeroNota, 
            dataCompra: dataEmissao,
            itens
        }
    });

    // Header Validation
    const newErrors = {
        ...errors,
        fornecedor: !idFornecedor,
        numeroNota: !numeroNota,
        dataEmissao: !dataEmissao
    }

    if (newErrors.fornecedor || newErrors.numeroNota || newErrors.dataEmissao) {
        setErrors(newErrors)
        toast({ title: "Erro", description: "Preencha os dados obrigatórios da nota.", variant: "destructive" })
        return
    }

    if (itens.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos um item.", variant: "destructive" })
      return
    }

    try {
      const payload = {
        idFornecedor: Number(idFornecedor), // Fixed key: idFornecedor
        numeroNota: numeroNota,             // Key expected by UseCase execute param
        dataCompra: dataEmissao,            // Key expected by UseCase execute param
        valorTotal: itens.reduce((acc, i) => acc + (i.quantidade * i.custoUnitario), 0), // Optional but good
        observacoes: observacoes,
        itens: itens.map(i => ({
            idProduto: Number(i.idProduto), // Ensure number
            quantidade: Number(i.quantidade),
            custoUnitario: Number(i.custoUnitario),
            validade: i.validade
        }))
      }
      
      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const err = await response.json()
        // console.error("Backend Error:", err) - let the catch handle or log here
        throw new Error(err.error || 'Falha ao lançar entrada')
      }

      toast({ title: "Sucesso", description: "Entrada lançada com sucesso!" })
      onSuccess()
      onClose()

    } catch (e: any) {
      console.error("Erro ao finalizar:", e)
      toast({ title: "Erro", description: e.message, variant: "destructive" })
      // Do NOT throw error here to avoid React overlay
    }
  }

  const totalNota = itens.reduce((acc, item) => acc + (item.quantidade * item.custoUnitario), 0)

  // Filtered Products
  const filteredProdutos = produtos.filter(p => p.nome.toLowerCase().includes(produtoSearchInfo.toLowerCase()))

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Max Width 6xl as requested */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Nova Entrada de Mercadoria</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Header (Mestre) */}
          <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 rounded-md border text-sm">
             <div className="col-span-12 font-semibold text-gray-700 mb-2">Dados da Nota</div>
             
             <div className="col-span-5">
               <label className="block text-gray-600 mb-1">Fornecedor *</label>
               <select 
                 className={`w-full p-2 border rounded ${errors.fornecedor ? 'border-red-500' : ''}`}
                 value={idFornecedor}
                 onChange={e => {
                    setIdFornecedor(e.target.value)
                    if(errors.fornecedor) setErrors({...errors, fornecedor: false})
                 }}
               >
                 <option value="">Selecione...</option>
                 {fornecedores.map(f => (
                   <option key={f.id} value={f.id}>{f.nome}</option>
                 ))}
               </select>
             </div>

             <div className="col-span-4">
               <label className="block text-gray-600 mb-1">Número da NF *</label>
               <input 
                 type="text" 
                 className={`w-full p-2 border rounded ${errors.numeroNota ? 'border-red-500' : ''}`}
                 value={numeroNota}
                 onChange={e => {
                    setNumeroNota(e.target.value)
                    if(errors.numeroNota) setErrors({...errors, numeroNota: false})
                 }}
                 placeholder="Ex: 123456"
               />
             </div>

             <div className="col-span-3">
               <label className="block text-gray-600 mb-1">Data Emissão *</label>
               <input 
                 type="date" 
                 className={`w-full p-2 border rounded ${errors.dataEmissao ? 'border-red-500' : ''}`}
                 value={dataEmissao}
                 onChange={e => {
                    setDataEmissao(e.target.value)
                    if(errors.dataEmissao) setErrors({...errors, dataEmissao: false})
                 }}
               />
             </div>

             <div className="col-span-12">
               <label className="block text-gray-600 mb-1">Observações</label>
               <textarea 
                 className="w-full p-2 border rounded resize-none"
                 rows={2}
                 placeholder="Opcional..."
                 value={observacoes}
                 onChange={e => setObservacoes(e.target.value)}
               />
             </div>
          </div>

          {/* Section 2: Items (Detalhe) */}
          <div className="border rounded-md p-4 space-y-4">
             <div className="font-semibold text-gray-700">Adicionar Itens</div>
             
             <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <label className="block text-xs text-gray-500 mb-1">Produto (Busca)</label>
                  <input 
                    type="text" 
                    placeholder="Filtrar produto..." 
                    className="w-full p-1 text-sm border rounded mb-1 bg-gray-50"
                    value={produtoSearchInfo}
                    onChange={e => setProdutoSearchInfo(e.target.value)}
                  />
                  <select 
                    className={`w-full p-2 border rounded h-10 ${errors.itemProduto ? 'border-red-500' : ''}`}
                    value={itemForm.idProduto}
                    onChange={e => {
                        setItemForm({...itemForm, idProduto: e.target.value})
                        if(errors.itemProduto) setErrors({...errors, itemProduto: false})
                    }}
                  >
                    <option value="">Selecione o produto...</option>
                    {filteredProdutos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                   <label className="block text-xs text-gray-500 mb-1">Qtd *</label>
                   <input 
                     type="number" 
                     className={`w-full p-2 border rounded h-10 ${errors.itemQtd ? 'border-red-500' : ''}`}
                     value={itemForm.quantidade}
                     onChange={e => {
                        setItemForm({...itemForm, quantidade: e.target.value})
                        if(errors.itemQtd) setErrors({...errors, itemQtd: false})
                     }}
                     min="1"
                   />
                </div>

                <div className="col-span-2">
                   <label className="block text-xs text-gray-500 mb-1">Custo Uni.(R$) *</label>
                   <input 
                     type="number" 
                     step="0.01"
                     className={`w-full p-2 border rounded h-10 ${errors.itemCusto ? 'border-red-500' : ''}`}
                     value={itemForm.custoUnitario}
                     onChange={e => {
                        setItemForm({...itemForm, custoUnitario: e.target.value})
                        if(errors.itemCusto) setErrors({...errors, itemCusto: false})
                     }}
                     placeholder="0.00"
                   />
                </div>

                <div className="col-span-3">
                   <label className="block text-xs text-gray-500 mb-1">Validade *</label>
                   <input 
                     type="date" 
                     className={`w-full p-2 border rounded h-10 ${errors.itemValidade ? 'border-red-500' : ''}`}
                     value={itemForm.validade}
                     onChange={e => {
                        setItemForm({...itemForm, validade: e.target.value})
                        if(errors.itemValidade) setErrors({...errors, itemValidade: false})
                     }}
                   />
                </div>

                <div className="col-span-1">
                  <button 
                    onClick={handleAddItem}
                    className="w-full h-10 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center justify-center"
                    title="Adicionar Item"
                  >
                    <Plus size={20} />
                  </button>
                </div>
             </div>
             
             {/* Temporary Table */}
             <div className="border rounded mt-4 max-h-60 overflow-y-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-100 text-gray-600 sticky top-0">
                   <tr>
                     <th className="p-2">Produto</th>
                     <th className="p-2 w-20">Qtd</th>
                     <th className="p-2 w-24">Custo Un.</th>
                     <th className="p-2 w-24">Subtotal</th>
                     <th className="p-2 w-24">Validade</th>
                     <th className="p-2 w-10"></th>
                   </tr>
                 </thead>
                 <tbody>
                    {itens.length === 0 ? (
                      <tr><td colSpan={6} className="p-4 text-center text-gray-400">Nenhum item adicionado</td></tr>
                    ) : (
                      itens.map((item, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="p-2">{item.nomeProduto}</td>
                          <td className="p-2">{item.quantidade}</td>
                          <td className="p-2">R$ {item.custoUnitario.toFixed(2)}</td>
                          <td className="p-2 font-medium">R$ {(item.quantidade * item.custoUnitario).toFixed(2)}</td>
                          <td className="p-2">{format(new Date(item.validade), 'dd/MM/yyyy')}</td>
                          <td className="p-2">
                             <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                               <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
           <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total da Nota</span>
              <span className="text-2xl font-bold text-gray-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalNota)}
              </span>
           </div>

           <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">
               Cancelar
             </button>
             <button 
               onClick={handleFinalizar}
               className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow-sm"
             >
               Finalizar Entrada
             </button>
           </div>
        </div>

      </div>
    </div>
  )
}
