"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Search, Trash2, Plus, ShoppingCart, CreditCard, ChevronLeft } from "lucide-react"
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

    const newItem = {
        idProduto: selectedProduto.id,
        nome: selectedProduto.nome,
        quantidade: qtd,
        precoUnitario: precoUnit,
        subtotal: qtd * precoUnit
    }

    setCart([...cart, newItem])
    
    // Reset inputs but keep focus flow if possible (for now just reset)
    setSelectedProduto(null)
    setQtd(1)
    setPrecoUnit(0)
  }

  const removeItem = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  
  // -- Handlers for Checkout --
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
                                    <td className="p-3 font-medium text-gray-800">{item.nome}</td>
                                    <td className="p-3 text-center">{item.quantidade}</td>
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
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
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
                                onSelect={() => {
                                    setSelectedCliente(null)
                                    setComboboxClienteOpen(false)
                                }}
                            >
                                Consumidor Final
                            </CommandItem>
                            {clientesList.map((cliente) => (
                                <CommandItem
                                key={cliente.id}
                                value={cliente.nome}
                                onSelect={() => {
                                    setSelectedCliente(cliente)
                                    setComboboxClienteOpen(false)
                                }}
                                >
                                {cliente.nome}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedCliente && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="bg-blue-50 p-2 rounded border border-blue-100">
                              <span className="text-xs text-blue-600 block">Limite Fiado</span>
                              <span className="font-bold text-blue-800">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedCliente.limiteFiado || 0)}
                              </span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded border border-purple-100">
                              <span className="text-xs text-purple-600 block">Pontos</span>
                              <span className="font-bold text-purple-800">{selectedCliente.pontos || 0}</span>
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

            {/* 3. Finalize Action */}
            <Button 
                className="h-20 bg-gray-900 hover:bg-black text-white text-xl font-bold shadow-lg rounded-xl"
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cart.length === 0}
            >
                <div className="flex items-center gap-3">
                    <CreditCard size={28} /> 
                    <span>FINALIZAR VENDA</span>
                </div>
            </Button>

        </div>
      </div>

      <ModalCheckout 
         isOpen={isCheckoutOpen}
         onClose={() => setIsCheckoutOpen(false)}
         cartTotal={subtotal}
         cliente={selectedCliente}
         cartItems={cart}
         onSuccess={handleFinalizeSuccess}
      />
    </div>
  )
}
