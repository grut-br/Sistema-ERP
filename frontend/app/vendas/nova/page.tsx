"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Search, Trash2, Plus, ShoppingCart, CreditCard, ChevronLeft, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
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
import { cn } from "@/lib/utils"
// Import Modal Checkout (to be created)
import { ModalCheckout } from "../components/modal-checkout"
import "../vendas.css"

export default function NovaVendaPage() {
  const { toast } = useToast()
  
  // -- Data State --
  const [clientesList, setClientesList] = useState<any[]>([])
  const [produtosList, setProdutosList] = useState<any[]>([])
  
  // -- UI State --
  const [comboboxClienteOpen, setComboboxClienteOpen] = useState(false)
  const [comboboxProdutoOpen, setComboboxProdutoOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // -- Transaction State --
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null)
  const [cart, setCart] = useState<any[]>([])
  
  // -- Current Item State --
  const [selectedProduto, setSelectedProduto] = useState<any | null>(null)
  const [qtd, setQtd] = useState(1)
  const [precoUnit, setPrecoUnit] = useState(0)

  // -- Stock Alert Modal State --
  const [showAlertEstoque, setShowAlertEstoque] = useState(false)
  const [pendingItem, setPendingItem] = useState<any | null>(null)
  const [estoqueInfo, setEstoqueInfo] = useState({ atual: 0, solicitado: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
        const [resClientes, resProdutos] = await Promise.all([
            fetch('/api/clientes'),
            fetch('/api/produtos')
        ])
        if (resClientes.ok) setClientesList(await resClientes.json())
        if (resProdutos.ok) setProdutosList(await resProdutos.json())
    } catch (error) {
        console.error("Erro ao carregar dados", error)
        toast({ title: "Erro", description: "Falha ao carregar dados iniciais.", variant: "destructive" })
    }
  }

  const handleSelectProduto = (produto: any) => {
    setSelectedProduto(produto)
    setPrecoUnit(Number(produto.precoVenda) || 0)
    setQtd(1)
    setComboboxProdutoOpen(false)
  }

  const addItemToCart = () => {
    if (!selectedProduto) return
    if (qtd <= 0) {
        toast({ title: "Erro", description: "Quantidade deve ser maior que zero.", variant: "destructive" })
        return
    }

    const estoqueAtual = selectedProduto.estoque ?? 0
    
    // Verifica se tem estoque suficiente
    if (qtd > estoqueAtual) {
        // Abre modal de alerta
        setEstoqueInfo({ atual: estoqueAtual, solicitado: qtd })
        setPendingItem({
            idProduto: selectedProduto.id,
            nome: selectedProduto.nome,
            quantidade: qtd,
            precoUnitario: precoUnit,
            subtotal: qtd * precoUnit,
            semEstoque: true  // Flag para indicador visual
        })
        setShowAlertEstoque(true)
        return
    }

    // Adiciona normalmente se tem estoque
    const newItem = {
        idProduto: selectedProduto.id,
        nome: selectedProduto.nome,
        quantidade: qtd,
        precoUnitario: precoUnit,
        subtotal: qtd * precoUnit,
        semEstoque: false
    }

    setCart([...cart, newItem])
    
    // Reset inputs
    setSelectedProduto(null)
    setQtd(1)
    setPrecoUnit(0)
  }

  // Função para forçar adição do item sem estoque
  const forcarAdicaoItem = () => {
    if (pendingItem) {
        setCart([...cart, pendingItem])
        setSelectedProduto(null)
        setQtd(1)
        setPrecoUnit(0)
    }
    setShowAlertEstoque(false)
    setPendingItem(null)
  }

  const cancelarAdicaoItem = () => {
    setShowAlertEstoque(false)
    setPendingItem(null)
  }

  const removeItem = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  // -- Client Financial Info --
  const [clientFinancials, setClientFinancials] = useState({ limiteFiado: 0, pontos: 0, saldoCredito: 0 })
  const [discountValue, setDiscountValue] = useState("")
  const [discountType, setDiscountType] = useState<'MONEY' | 'PERCENT'>('MONEY')

  // ... exisiting code ...

  const handleSelectCliente = async (cliente: any) => {
      setSelectedCliente(cliente)
      setComboboxClienteOpen(false)
      
      // Fetch Financial Info
      if (cliente) {
          try {
              const res = await fetch(`/api/clientes/${cliente.id}/info-financeira`)
              if (res.ok) {
                  const info = await res.json()
                  setClientFinancials(info)
              }
          } catch (e) {
              console.error(e)
          }
      }
  }

  // ... existing code ...
  
  // Calculate Totals with Discount
  const rawSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  
  let discountAmount = 0
  if (discountValue) {
      const val = parseFloat(discountValue)
      if (discountType === 'MONEY') discountAmount = val
      else discountAmount = rawSubtotal * (val / 100)
  }
  
  const totalWithDiscount = Math.max(0, rawSubtotal - discountAmount)

  // ... render ...

  const handleFinalizeSuccess = () => {
    setCart([])
    setSelectedCliente(null)
    toast({ title: "Sucesso", description: "Venda realizada com sucesso!" })
    setIsCheckoutOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-4 transition-all h-screen flex gap-4 overflow-hidden">
        
        {/* LEFT COLUMN: CART */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-2 text-gray-700">
                    <Link href="/vendas" className="hover:bg-gray-200 p-1 rounded-full transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCart size={20} /> Carrinho
                    </h2>
                </div>
                <div className="text-sm text-gray-500">{cart.length} itens</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                        <p>Carrinho vazio</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="text-xs text-gray-500 border-b border-gray-100 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="text-left p-3">Produto</th>
                                <th className="text-center p-3">Qtd</th>
                                <th className="text-right p-3">Unitário</th>
                                <th className="text-right p-3">Total</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {cart.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            {item.semEstoque && <TriangleAlert size={14} className="text-red-500" />}
                                            {item.nome}
                                        </div>
                                    </td>
                                    <td className={`p-3 text-center ${item.semEstoque ? 'text-red-600 font-bold' : ''}`}>
                                        {item.quantidade}
                                    </td>
                                    <td className="p-3 text-right">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}
                                    </td>
                                    <td className="p-3 text-right font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="p-6 bg-gray-800 text-white rounded-b-xl mt-auto">
                <div className="flex justify-between items-end">
                    <div className="text-gray-400 text-sm">Total a Pagar</div>
                    <div className="text-4xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalWithDiscount)}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS */}
        <div className="w-1/3 flex flex-col gap-4">
            
            {/* 1. Cliente Selection */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Cliente</h3>
                <Popover open={comboboxClienteOpen} onOpenChange={setComboboxClienteOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between bg-gray-50 border-gray-200 hover:bg-white h-12"
                      >
                        {selectedCliente ? selectedCliente.nome : "Selecionar Cliente (Opcional)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 z-[50]" align="end">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                            <CommandGroup>
                            <CommandItem
                                value="consumidor"
                                onSelect={() => handleSelectCliente({ id: null, nome: "Consumidor Final" })}
                            >
                                Consumidor Final
                            </CommandItem>
                            {clientesList.map((cliente) => (
                                <CommandItem
                                key={cliente.id}
                                value={cliente.nome}
                                onSelect={() => handleSelectCliente(cliente)}
                                >
                                {cliente.nome}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedCliente && selectedCliente.id && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-[10px] text-blue-600 block uppercase">Limite Fiado</span>
                              <span className="font-bold text-blue-800 text-sm">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientFinancials.limiteFiado)}
                              </span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded border border-purple-100">
                              <span className="text-[10px] text-purple-600 block uppercase">Pontos</span>
                              <span className="font-bold text-purple-800 text-sm">{clientFinancials.pontos}</span>
                          </div>
                           <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                              <span className="text-[10px] text-emerald-600 block uppercase">Saldo Crédito</span>
                              <span className="font-bold text-emerald-800 text-sm">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientFinancials.saldoCredito)}
                              </span>
                          </div>
                      </div>
                  )}
            </div>

            {/* 2. Add Product */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                 <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Adicionar Item</h3>
                 
                 <div className="flex flex-col gap-4">
                    <Popover open={comboboxProdutoOpen} onOpenChange={setComboboxProdutoOpen}>
                        <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-14 text-base font-normal bg-gray-50 border-gray-200"
                        >
                            {selectedProduto ? selectedProduto.nome : "Buscar Produto (Nome/Código)"}
                             <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0 z-[50]" align="start">
                        <Command>
                            <CommandInput placeholder="Digite nome ou código..." />
                            <CommandList>
                                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                <CommandGroup>
                                    {produtosList.map((produto) => (
                                        <CommandItem
                                        key={produto.id}
                                        value={produto.nome}
                                        onSelect={() => handleSelectProduto(produto)}
                                        >
                                        <div className="flex justify-between w-full">
                                            <span>{produto.nome}</span>
                                            <span className="text-gray-400 text-xs">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.precoVenda)}
                                            </span>
                                        </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        </PopoverContent>
                    </Popover>

                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="text-xs text-gray-500 mb-1 block">Qtd</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border border-gray-200 rounded-lg text-center font-bold text-lg"
                                value={qtd}
                                onChange={(e) => setQtd(Number(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') addItemToCart() }}
                            />
                        </div>
                        <div className="w-2/3">
                            <label className="text-xs text-gray-500 mb-1 block">Preço Unit (R$)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border border-gray-200 rounded-lg text-right font-bold text-lg"
                                value={precoUnit}
                                onChange={(e) => setPrecoUnit(Number(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') addItemToCart() }}
                            />
                        </div>
                    </div>

                    <Button 
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold mt-4"
                        onClick={addItemToCart}
                        disabled={!selectedProduto}
                    >
                        Adicionar Item +
                    </Button>
                 </div>
            </div>

            {/* Discount Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Desconto</h3>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="0.00"
                        className="flex-1 p-2 border border-gray-200 rounded text-right font-medium"
                        value={discountValue}
                        onChange={e => setDiscountValue(e.target.value)}
                    />
                    <div className="flex bg-gray-100 rounded p-1">
                        <button 
                            className={`px-3 py-1 text-sm rounded ${discountType === 'PERCENT' ? 'bg-white shadow' : 'text-gray-500'}`}
                            onClick={() => setDiscountType('PERCENT')}
                        >%</button>
                        <button 
                             className={`px-3 py-1 text-sm rounded ${discountType === 'MONEY' ? 'bg-white shadow' : 'text-gray-500'}`}
                             onClick={() => setDiscountType('MONEY')}
                        >R$</button>
                    </div>
                </div>
            </div>

            {/* Finalize Button */}
            <Button 
                className="h-20 bg-gray-900 hover:bg-black text-white text-xl font-bold shadow-lg rounded-xl flex justify-between px-6"
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cart.length === 0}
            >
                <div className="flex flex-col items-start">
                     <span className="text-xs font-normal text-gray-400">TOTAL</span>
                     <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalWithDiscount)}</span>
                </div>
                <div className="flex items-center gap-2 text-base font-normal opacity-80">
                    <span>FINALIZAR</span>
                    <ChevronLeft  className="rotate-180" size={20} />
                </div>
            </Button>

        </div>
      </div>

      {/* MODAL DE ALERTA - ESTOQUE INSUFICIENTE */}
      {showAlertEstoque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <TriangleAlert className="text-red-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-red-600">ESTOQUE INSUFICIENTE</h2>
            </div>
            
            <p className="text-gray-700 mb-6">
              <strong>Estoque atual:</strong> {estoqueInfo.atual} unidades<br />
              <strong>Solicitado:</strong> {estoqueInfo.solicitado} unidades<br /><br />
              Deseja forçar a venda e <span className="text-red-600 font-bold">negativar o estoque</span>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarAdicaoItem}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={forcarAdicaoItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                VENDER MESMO ASSIM
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalCheckout 
         isOpen={isCheckoutOpen}
         onClose={() => setIsCheckoutOpen(false)}
         cartTotal={totalWithDiscount}
         subtotalOriginal={rawSubtotal}
         discountValue={discountAmount}
         cliente={{...selectedCliente, ...clientFinancials}} 
         cartItems={cart}
         onSuccess={handleFinalizeSuccess}
      />
    </div>
  )
}
