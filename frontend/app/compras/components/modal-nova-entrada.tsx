import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox" // Assuming we have this, or standard input type checkbox

interface ModalNovaEntradaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onNovoProduto?: () => void
  compraParaEditar?: any
}

interface ItemCarrinho {
  idProduto: number
  nomeProduto: string
  quantidade: number
  custoUnitario: number
  validade: string | null
}

export const ModalNovaEntrada = ({ isOpen, onClose, onSuccess, onNovoProduto, compraParaEditar }: ModalNovaEntradaProps) => {
  const { toast } = useToast()

  // Data Lists
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])

  // Header State
  const [idFornecedor, setIdFornecedor] = useState("")
  const [numeroNota, setNumeroNota] = useState("")
  const [dataEmissao, setDataEmissao] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [observacoes, setObservacoes] = useState("")

  // Payment State
  const [formaPagamento, setFormaPagamento] = useState("DINHEIRO")
  const [qtdParcelas, setQtdParcelas] = useState("1")
  const [intervaloParcelas, setIntervaloParcelas] = useState("MENSAL")
  const [dataPrimeiroVencimento, setDataPrimeiroVencimento] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [statusPagamento, setStatusPagamento] = useState("PENDENTE") // PENDENTE or PAGO
  
  // Item Form State
  const [itemForm, setItemForm] = useState({
    idProduto: "",
    quantidade: "",
    custoUnitario: "",
    validade: ""
  })
  
  const [semValidade, setSemValidade] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

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

  useEffect(() => {
    if (isOpen) {
      fetchFornecedores()
      fetchProdutos()
      if (!compraParaEditar) {
        resetForm()
      }
    }
  }, [isOpen])

  // Load data when editing
  useEffect(() => {
    if (isOpen && compraParaEditar) {
      setIdFornecedor(String(compraParaEditar.idFornecedor || ''))
      setNumeroNota(compraParaEditar.notaFiscal || '')
      setDataEmissao(compraParaEditar.dataCompra || format(new Date(), 'yyyy-MM-dd'))
      setObservacoes(compraParaEditar.observacoes || '')
      
      // Load items from lotes
      if (compraParaEditar.itens && compraParaEditar.itens.length > 0) {
        const itensCarregados: ItemCarrinho[] = compraParaEditar.itens.map((item: any) => ({
          idProduto: item.idProduto,
          nomeProduto: item.produto?.nome || item.Produto?.nome || 'Produto',
          quantidade: item.quantidade,
          custoUnitario: item.custoUnitario,
          validade: item.validade || null
        }))
        setItens(itensCarregados)
      }
    }
  }, [isOpen, compraParaEditar])

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
    setFormaPagamento("DINHEIRO")
    setQtdParcelas("1")
    setIntervaloParcelas("MENSAL")
    setDataPrimeiroVencimento(format(new Date(), 'yyyy-MM-dd'))
    setStatusPagamento("PENDENTE")
    setItens([])
    resetItemForm()
  }

  // Auto-enforce rule for Credit Card
  useEffect(() => {
    if (formaPagamento === 'CARTAO_CREDITO') {
        setIntervaloParcelas('MENSAL')
    }
  }, [formaPagamento])

  const resetItemForm = () => {
    setItemForm({
      idProduto: "",
      quantidade: "",
      custoUnitario: "",
      validade: ""
    })
    setSemValidade(false)
  }

  const handleAddItem = () => {
    // Validation
    const isValidadeRequired = !semValidade;

    const newErrors = {
        ...errors,
        itemProduto: !itemForm.idProduto,
        itemQtd: !itemForm.quantidade,
        itemCusto: !itemForm.custoUnitario,
        itemValidade: isValidadeRequired && !itemForm.validade
    }
    
    if (newErrors.itemProduto || newErrors.itemQtd || newErrors.itemCusto || newErrors.itemValidade) {
        setErrors(newErrors)
        toast({ title: "Erro", description: "Preencha todos os campos obrigatórios do item.", variant: "destructive" })
        return
    }

    const produtoSelected = produtos.find(p => p.id === Number(itemForm.idProduto))
    if (!produtoSelected) return

    const novoItem: ItemCarrinho = {
      idProduto: Number(itemForm.idProduto),
      nomeProduto: produtoSelected.nome,
      quantidade: Number(itemForm.quantidade),
      custoUnitario: Number(itemForm.custoUnitario.replace(',', '.')),
      validade: semValidade ? null : itemForm.validade
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
        idFornecedor: Number(idFornecedor),
        numeroNota: numeroNota,
        dataCompra: dataEmissao,
        valorTotal: itens.reduce((acc, i) => acc + (i.quantidade * i.custoUnitario), 0),
        observacoes: observacoes,
        itens: itens.map(i => ({
            idProduto: Number(i.idProduto),
            quantidade: Number(i.quantidade),
            custoUnitario: Number(i.custoUnitario),
            validade: i.validade
        })),
        // Payment Info
        formaPagamento,
        qtdParcelas: Number(qtdParcelas),
        intervaloParcelas,
        dataPrimeiroVencimento,
        statusPagamento
      }
      
      const url = compraParaEditar ? `/api/compras/${compraParaEditar.id}` : '/api/compras'
      const method = compraParaEditar ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Falha ao lançar entrada')
      }

      toast({ title: "Sucesso", description: compraParaEditar ? "Entrada atualizada com sucesso!" : "Entrada lançada com sucesso!" })
      onSuccess()
      onClose()

    } catch (e: any) {
      console.error("Erro ao finalizar:", e)
      toast({ title: "Erro", description: e.message, variant: "destructive" })
    }
  }

  const totalNota = itens.reduce((acc, item) => acc + (item.quantidade * item.custoUnitario), 0)

  if (!isOpen) return null

  // Find selected product name for Combobox display
  const selectedProductName = produtos.find(p => String(p.id) === itemForm.idProduto)?.nome

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header - Green to match other modals */}
        <div className="bg-emerald-500 text-white p-6 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">{compraParaEditar ? 'Editar Entrada de Mercadoria' : 'Nova Entrada de Mercadoria'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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
               {errors.fornecedor && <span className="text-red-500 text-xs mt-1 block">Campo obrigatório</span>}
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
               {errors.numeroNota && <span className="text-red-500 text-xs mt-1 block">Campo obrigatório</span>}
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
               {errors.dataEmissao && <span className="text-red-500 text-xs mt-1 block">Campo obrigatório</span>}
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

          {/* Section 1.5: Condições de Pagamento */}
          <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 rounded-md border text-sm">
             <div className="col-span-12 font-semibold text-gray-700 mb-2">Condições de Pagamento</div>

             <div className="col-span-3">
               <label className="block text-gray-600 mb-1">Forma de Pagamento</label>
               <select 
                 className="w-full p-2 border rounded"
                 value={formaPagamento}
                 onChange={e => setFormaPagamento(e.target.value)}
               >
                 <option value="DINHEIRO">Dinheiro</option>
                 <option value="PIX">Pix</option>
                 <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                 <option value="CARTAO_DEBITO">Cartão de Débito</option>
                 <option value="BOLETO">Boleto (A Prazo)</option>
               </select>
             </div>

             <div className="col-span-2">
               <label className="block text-gray-600 mb-1">Nº Parcelas</label>
               <input 
                 type="number" 
                 min="1"
                 className="w-full p-2 border rounded"
                 value={qtdParcelas}
                 onChange={e => setQtdParcelas(e.target.value)}
               />
             </div>

             <div className="col-span-3">
               <label className="block text-gray-600 mb-1">Intervalo</label>
               <select 
                 className="w-full p-2 border rounded disabled:bg-gray-200 disabled:text-gray-500"
                 value={intervaloParcelas}
                 onChange={e => setIntervaloParcelas(e.target.value)}
                 disabled={formaPagamento === 'CARTAO_CREDITO'}
               >
                 <option value="MENSAL">Mensal (30 dias)</option>
                 <option value="QUINZENAL">Quinzenal (15 dias)</option>
               </select>
             </div>

             <div className="col-span-4">
               <label className="block text-gray-600 mb-1">1º Vencimento</label>
               <input 
                 type="date" 
                 className="w-full p-2 border rounded"
                 value={dataPrimeiroVencimento}
                 onChange={e => setDataPrimeiroVencimento(e.target.value)}
               />
             </div>

             <div className="col-span-12 flex items-center gap-2 mt-2">
                <input
                    type="checkbox"
                    id="statusPago"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={statusPagamento === 'PAGO'}
                    onChange={(e) => setStatusPagamento(e.target.checked ? 'PAGO' : 'PENDENTE')}
                />
                <label htmlFor="statusPago" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                    Entrada já realizada/paga (Marcar financeiro como PAGO)
                </label>
             </div>
          </div>

          {/* Section 2: Items (Detalhe) */}
          <div className="border rounded-md p-4 space-y-4">
             <div className="font-semibold text-gray-700">Adicionar Itens</div>
             
             {/* New Layout Grid */}
             <div className="flex gap-4 items-start">
                
                {/* 1. Produto - 35% */}
                <div className="w-[35%]">
                  <label className="block text-xs text-gray-500 mb-1">Produto *</label>
                  <div className="flex gap-1">
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className={`flex-1 justify-between h-10 ${errors.itemProduto ? 'border-red-500' : ''}`}
                        >
                          {itemForm.idProduto
                            ? selectedProductName
                            : "Selecione o produto..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0 z-[9999]">
                        <Command>
                          <CommandInput placeholder="Procurar produto..." />
                          <CommandList>
                              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                              <CommandGroup>
                              {produtos.map((produto) => (
                                  <CommandItem
                                  key={produto.id}
                                  value={produto.nome}
                                  onSelect={(currentValue) => {
                                      // ComboBox logic for selection
                                      setItemForm(prev => ({...prev, idProduto: String(produto.id)}))
                                      setComboboxOpen(false)
                                      if(errors.itemProduto) setErrors(e => ({...e, itemProduto: false}))
                                  }}
                                  >
                                  <Check
                                      className={cn(
                                      "mr-2 h-4 w-4",
                                      itemForm.idProduto === String(produto.id) ? "opacity-100" : "opacity-0"
                                      )}
                                  />
                                  {produto.nome}
                                  </CommandItem>
                              ))}
                              </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <button
                      type="button"
                      onClick={onNovoProduto}
                      className="h-10 w-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded shrink-0"
                      title="Cadastrar novo produto"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {errors.itemProduto && <span className="text-red-500 text-xs mt-1 block">Selecione um produto</span>}
                </div>

                {/* 2. Qtd - 10% */}
                <div className="w-[10%]">
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
                   {errors.itemQtd && <span className="text-red-500 text-xs mt-1 block">Obrigatório</span>}
                </div>

                {/* 3. Custo Uni - 15% */}
                <div className="w-[15%]">
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
                   {errors.itemCusto && <span className="text-red-500 text-xs mt-1 block">Obrigatório</span>}
                </div>

                 {/* 4. Sem Validade Checkbox - Auto width */}
                <div className="flex items-center gap-1.5 h-10 pb-2 pt-6">
                    <input
                        type="checkbox"
                        id="semValidade"
                        checked={semValidade}
                        onChange={(e) => {
                            setSemValidade(e.target.checked)
                            if (e.target.checked) {
                                setItemForm(prev => ({...prev, validade: ""}))
                                if(errors.itemValidade) setErrors(prev => ({...prev, itemValidade: false}))
                            }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="semValidade" className="text-xs text-gray-600 cursor-pointer select-none">
                        S/ Validade
                    </label>
                </div>

                {/* 5. Validade - 25% (Remaining adjusts if needed, but flex handles simple width here effectively) */}
                <div className="w-[20%]">
                   <label className="block text-xs text-gray-500 mb-1">Validade {semValidade ? '(N/A)' : '*'}</label>
                   <input 
                     type="date" 
                     disabled={semValidade}
                     className={`w-full p-2 border rounded h-10 ${errors.itemValidade && !semValidade ? 'border-red-500' : ''} ${semValidade ? 'bg-gray-100 text-gray-400' : ''}`}
                     value={itemForm.validade}
                     onChange={e => {
                        setItemForm({...itemForm, validade: e.target.value})
                        if(errors.itemValidade) setErrors({...errors, itemValidade: false})
                     }}
                   />
                   {errors.itemValidade && !semValidade && <span className="text-red-500 text-xs mt-1 block">Obrigatório</span>}
                </div>

                {/* 6. Button - 5% */}
                <div className="w-[5%] pt-6">
                  <button 
                    onClick={handleAddItem}
                    className="w-full h-10 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center justify-center transition-colors"
                    title="Adicionar Item"
                  >
                    <Plus size={20} />
                  </button>
                </div>
             </div>
             
             {/* Table Items */}
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
                          <td className="p-2">R$ {Number(item.custoUnitario).toFixed(2)}</td>
                          <td className="p-2 font-medium">R$ {(Number(item.quantidade) * Number(item.custoUnitario)).toFixed(2)}</td>
                          <td className="p-2">{item.validade ? format(new Date(item.validade), 'dd/MM/yyyy') : 'N/A'}</td>
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
               {compraParaEditar ? 'Salvar Alterações' : 'Finalizar Entrada'}
             </button>
           </div>
        </div>

      </div>
    </div>
  )
}
