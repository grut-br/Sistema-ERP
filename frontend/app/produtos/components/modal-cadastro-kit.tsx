import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Search, Plus, Trash2, AlertTriangle, Package } from "lucide-react"

interface ModalCadastroKitProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  kitParaEditar?: any
}

// Interface for Component Items in the Builder
interface ComponenteKit {
    idProdutoFilho: number
    nome: string
    quantidade: number
    precoOriginal: number
    estoqueAtual: number
}

export const ModalCadastroKit = ({ isOpen, onClose, onSuccess, kitParaEditar }: ModalCadastroKitProps) => {
  const { toast } = useToast()
  
  // Basic Kit Data
  const [formData, setFormData] = useState({
    nome: "",
    idCategoria: "",
    precoVenda: "",
    status: "ATIVO",
    codigoBarras: "",
    descricao: ""
  })

  // Builder Data
  const [componentes, setComponentes] = useState<ComponenteKit[]>([])
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Dropdowns
  const [categorias, setCategorias] = useState<any[]>([])

  // Validation State
  const [validationErrors, setValidationErrors] = useState({
    nome: false,
    idCategoria: false,
    precoVenda: false
  })

  // Clear validation when changing fields
  useEffect(() => {
     if (validationErrors.nome && formData.nome) setValidationErrors(prev => ({ ...prev, nome: false }))
     if (validationErrors.precoVenda && formData.precoVenda) setValidationErrors(prev => ({ ...prev, precoVenda: false }))
  }, [formData.nome, formData.precoVenda])

  useEffect(() => {
    if (isOpen) {
        fetchCategorias()
        setSearchTerm("")
        setSearchResults([])
        
        if (kitParaEditar) {
            // Load Kit Data
            setFormData({
                nome: kitParaEditar.nome,
                idCategoria: kitParaEditar.idCategoria || kitParaEditar.categoria?.id || "",
                precoVenda: String(kitParaEditar.precoVenda).replace('.', ','),
                status: kitParaEditar.status || "ATIVO",
                codigoBarras: kitParaEditar.codigoBarras || "",
                descricao: kitParaEditar.descricao || ""
            })

            // Load Components
            if (kitParaEditar.componentes && kitParaEditar.componentes.length > 0) {
                const compsMapped = kitParaEditar.componentes.map((c: any) => ({
                    idProdutoFilho: c.idProdutoFilho,
                    nome: c.produto?.nome || "Produto",
                    quantidade: c.quantidade,
                    precoOriginal: c.produto?.precoVenda || 0,
                    estoqueAtual: c.produto?.estoque || 0
                }))
                setComponentes(compsMapped)
            } else {
                setComponentes([])
            }
        } else {
            // Reset
            setFormData({
                nome: "",
                idCategoria: "",
                precoVenda: "",
                status: "ATIVO",
                codigoBarras: "",
                descricao: ""
            })
            setComponentes([])
        }
    }
  }, [isOpen, kitParaEditar])

  const fetchCategorias = async () => {
      try {
          const res = await fetch('/api/categorias')
          if (res.ok) setCategorias(await res.json())
      } catch (e) { console.error(e) }
  }

  // Search Logic
  useEffect(() => {
      const delayDebounce = setTimeout(async () => {
          if (searchTerm.length > 2) {
              setIsSearching(true)
              try {
                  const res = await fetch('/api/produtos') // Ideally filter by name API side
                  const allProducts = await res.json()
                  // Client side filter for now & eKit=false
                  const filtered = allProducts.filter((p: any) => 
                      !p.eKit && 
                      p.nome.toLowerCase().includes(searchTerm.toLowerCase())
                  ).slice(0, 5) // Limit 5
                  setSearchResults(filtered)
              } catch (e) {
                  console.error(e)
              } finally {
                  setIsSearching(false)
              }
          } else {
              setSearchResults([])
          }
      }, 500)
      return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const addComponent = (produto: any) => {
      // Check if already exists
      if (componentes.find(c => c.idProdutoFilho === produto.id)) {
          toast({ title: "Item já adicionado", description: "Aumente a quantidade na lista." })
          return
      }

      setComponentes(prev => [...prev, {
          idProdutoFilho: produto.id,
          nome: produto.nome,
          quantidade: 1,
          precoOriginal: Number(produto.precoVenda),
          estoqueAtual: produto.estoque || 0
      }])
      setSearchTerm("") // Clear search
  }

  const removeComponent = (id: number) => {
      setComponentes(prev => prev.filter(c => c.idProdutoFilho !== id))
  }

  const updateQuantity = (id: number, delta: number) => {
      setComponentes(prev => prev.map(c => {
          if (c.idProdutoFilho === id) {
              const newQty = Math.max(1, c.quantidade + delta)
              return { ...c, quantidade: newQty }
          }
          return c
      }))
  }
  
  // Totals
  const somaItens = componentes.reduce((acc, c) => acc + (c.precoOriginal * c.quantidade), 0)
  
   const handleSave = async () => {
       const errors = {
           nome: !formData.nome.trim(),
           // idCategoria is handled automatically or not required in UI
           idCategoria: false, 
           precoVenda: !formData.precoVenda
       }
       
       setValidationErrors(errors)

       if (errors.nome || errors.precoVenda || componentes.length === 0) {
           toast({ title: "Erro", description: "Preencha os campos obrigatórios e adicione itens.", variant: "destructive" })
           return
       }
       
       // Ensure we have a category. If not, try to pick the first one or default to 1
       const categoryIdToSave = formData.idCategoria ? Number(formData.idCategoria) : (categorias.length > 0 ? categorias[0].id : 1);

       const payload = {
           nome: formData.nome,
           idCategoria: categoryIdToSave,
           precoVenda: Number(formData.precoVenda.replace(',', '.')),
           status: formData.status,
           codigoBarras: formData.codigoBarras || null,
           descricao: formData.descricao,
           eKit: true, // IMPORTANT
           composicao: componentes.map(c => ({
               idProdutoFilho: c.idProdutoFilho,
               quantidade: c.quantidade,
               precoNoCombo: c.precoOriginal 
           }))
       }

       try {
           const url = kitParaEditar ? `/api/produtos/${kitParaEditar.id}` : '/api/produtos'
           const method = kitParaEditar ? 'PUT' : 'POST'
           
           const res = await fetch(url, {
               method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
           })

           if (!res.ok) throw new Error("Erro ao salvar Kit")
           
           toast({ title: "Sucesso", description: "Kit salvo com sucesso!" })
           onSuccess()
           onClose()
       } catch (e) {
           console.error(e)
           toast({ title: "Erro", description: "Falha ao salvar Kit.", variant: "destructive" })
       }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header - Green to match other modals */}
        <div className="bg-emerald-500 text-white p-6 rounded-t-xl flex justify-between items-center">
           <h2 className="text-xl font-bold flex items-center gap-2">
               <Package />
               {kitParaEditar ? "Editar Kit / Combo" : "Novo Kit / Combo"}
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X size={24} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: '400px' }}>
            
            {/* Top: Basic Info */}
            <div className="grid grid-cols-12 gap-4 mb-8">
                <div className="col-span-9">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Kit *</label>
                    <input 
                        type="text" 
                        className={`w-full p-2 border rounded-md ${validationErrors.nome ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        value={formData.nome}
                        onChange={e => setFormData({...formData, nome: e.target.value})}
                        autoFocus
                    />
                </div>
                
                <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                        className="w-full p-2 border rounded-md bg-white"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                     >
                         <option value="ATIVO">ATIVO</option>
                         <option value="INATIVO">INATIVO</option>
                     </select>
                </div>
                 <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        value={formData.codigoBarras}
                        onChange={e => setFormData({...formData, codigoBarras: e.target.value})}
                    />
                </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <div className="grid grid-cols-12 gap-8">
                
                {/* Left: Builder */}
                <div className="col-span-8 space-y-4">
                    <h3 className="font-semibold text-gray-700">Composição do Kit</h3>
                    
                    {/* Search Component */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-10 p-2 border rounded-md bg-gray-50 focus:bg-white transition-colors"
                            placeholder="Buscar produtos para adicionar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {/* Results Dropdown */}
                        {searchTerm.length > 2 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">Nenhum produto encontrado</div>
                                ) : (
                                    searchResults.map((p: any) => (
                                        <div 
                                            key={p.id}
                                            className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                                            onClick={() => addComponent(p)}
                                        >
                                            <div>
                                                <div className="font-medium text-sm text-gray-800">{p.nome}</div>
                                                <div className="text-xs text-gray-500">Estoque: {p.estoque || 0}</div>
                                            </div>
                                            <div className="text-indigo-600">
                                                <Plus size={18} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Component List */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="p-3 text-left">Produto</th>
                                    <th className="p-3 text-right">Preço Orig.</th>
                                    <th className="p-3 text-center w-32">Qtd</th>
                                    <th className="p-3 text-center w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {componentes.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Nenhum componente adicionado</td></tr>
                                ) : (
                                    componentes.map(comp => (
                                        <tr key={comp.idProdutoFilho} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{comp.nome}</td>
                                            <td className="p-3 text-right text-gray-500">
                                                R$ {Number(comp.precoOriginal || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 flex justify-center items-center gap-2">
                                                <button onClick={() => updateQuantity(comp.idProdutoFilho, -1)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">-</button>
                                                <span className="w-8 text-center font-semibold">{comp.quantidade}</span>
                                                <button onClick={() => updateQuantity(comp.idProdutoFilho, 1)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">+</button>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => removeComponent(comp.idProdutoFilho)} className="text-red-400 hover:text-red-600">
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

                {/* Right: Totals & Pricing */}
                <div className="col-span-4">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-0 space-y-6">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Soma dos Itens</div>
                            <div className="text-2xl font-bold text-gray-400">
                                R$ {somaItens.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Final do Kit *</label>
                            <input 
                                type="text"
                                className={`w-full p-3 text-xl font-bold text-emerald-600 border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none ${validationErrors.precoVenda ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                value={formData.precoVenda}
                                onChange={e => setFormData({...formData, precoVenda: e.target.value.replace(/[^0-9,]/g, '')})}
                                placeholder="0,00"
                            />
                        </div>

                        {/* Discount Calc */}
                         {Number(formData.precoVenda.replace(',', '.')) > 0 && (
                             <div className="pt-4 border-t border-gray-200">
                                 <div className="flex justify-between items-center text-sm">
                                     <span className="text-gray-600">Diferença/Desconto:</span>
                                     <span className="font-semibold text-emerald-600">
                                         R$ {(somaItens - Number(formData.precoVenda.replace(',', '.'))).toFixed(2).replace('.', ',')}
                                     </span>
                                 </div>
                             </div>
                         )}

                         <div className="pt-4">
                             <button 
                             className="btn-save w-full"
                                onClick={handleSave}
                             >
                                 Salvar Kit
                             </button>
                         </div>
                    </div>
                </div>

            </div>

        </div>

      </div>
    </div>
  )
}
