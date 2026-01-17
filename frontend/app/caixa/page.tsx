"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Wallet, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Lock } from "lucide-react"
import "./caixa.css"
import { ModalMovimentacao } from "./components/modal-movimentacao"
import { ModalFecharCaixa } from "./components/modal-fechar-caixa"
import { Pagination } from "@/components/Pagination"

export default function CaixaPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [caixaAberto, setCaixaAberto] = useState(false)
    const [sessaoData, setSessaoData] = useState<any>(null)
    
    // Forms
    const [saldoInicialInput, setSaldoInicialInput] = useState("")
    
    // Modals
    const [showSangria, setShowSangria] = useState(false)
    const [showSuprimento, setShowSuprimento] = useState(false)
    const [showFechar, setShowFechar] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(15)

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/caixa/status')
            if (res.ok) {
                const data = await res.json()
                setCaixaAberto(data.aberto)
                if (data.aberto) {
                    setSessaoData(data.sessao)
                } else {
                    setSessaoData(null)
                }
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Erro", description: "Falha ao carregar status do caixa", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAbrirCaixa = async (e: React.FormEvent) => {
        e.preventDefault()
        const saldo = parseFloat(saldoInicialInput.replace(',', '.'))
        if (isNaN(saldo)) {
             toast({ title: "Erro", description: "Valor inválido", variant: "destructive" })
             return
        }

        try {
            const res = await fetch('/api/caixa/abrir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ saldo_inicial: saldo })
            })

            if (!res.ok) throw new Error('Falha ao abrir caixa')
            
            toast({ title: "Sucesso", description: "Caixa aberto com sucesso!" })
            setSaldoInicialInput("")
            fetchStatus()
        } catch (error) {
             toast({ title: "Erro", description: "Não foi possível abrir o caixa.", variant: "destructive" })
        }
    }

    const handleMovimentacao = async (tipo: 'SANGRIA' | 'SUPRIMENTO', valor: number, descricao: string) => {
        if (!sessaoData) return

        try {
            const res = await fetch('/api/caixa/movimentacao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_sessao: sessaoData.id,
                    tipo,
                    valor,
                    descricao,
                    forma_pagamento: 'DINHEIRO' // Manual ops always cash usually? Or should we ask? Requirement implies manual cash movement for bleed/supply.
                })
            })

            if (!res.ok) throw new Error('Falha ao registrar movimentação')

            toast({ title: "Sucesso", description: `${tipo} registrada com sucesso.` })
            fetchStatus()
        } catch (error) {
            toast({ title: "Erro", description: "Erro ao registrar movimentação.", variant: "destructive" })
            throw error
        }
    }

    const handleFecharCaixa = async (saldoInformado: number) => {
        if (!sessaoData) return

         try {
            const res = await fetch('/api/caixa/fechar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_sessao: sessaoData.id,
                    saldo_final_informado: saldoInformado
                })
            })

            if (!res.ok) throw new Error('Falha ao fechar caixa')

            const data = await res.json()
            toast({ 
                title: "Caixa Fechado", 
                description: `Diferença: R$ ${data.diferenca}` 
            })
            fetchStatus()
        } catch (error) {
            toast({ title: "Erro", description: "Erro ao fechar caixa.", variant: "destructive" })
            throw error 
        }
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Carregando...</p>
            </div>
        )
    }

    return (
        <div className="caixa-layout">
            <Sidebar />
            
            <div className="caixa-content">
                <div className="caixa-header">
                    <h1>Controle de Caixa</h1>
                </div>

                {!caixaAberto ? (
                    <div className="caixa-closed-container">
                        <div className="mb-4 bg-gray-100 p-4 rounded-full">
                            <Lock size={48} className="text-gray-400" />
                        </div>
                        <h2>O Caixa está Fechado</h2>
                        <p className="text-gray-500 mb-6">Informe o Fundo de Troco para iniciar as operações do dia.</p>
                        
                        <form onSubmit={handleAbrirCaixa} className="w-full">
                            <div className="input-group">
                                <label>Saldo Inicial (Fundo de Troco)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="input-money"
                                    placeholder="R$ 0,00"
                                    value={saldoInicialInput}
                                    onChange={(e) => setSaldoInicialInput(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-abrir">Abrir Caixa</button>
                        </form>
                    </div>
                ) : (
                    <div className="caixa-dashboard animate-in fade-in duration-300">
                        {/* Status Cards */}
                        <div className="dashboard-grid">
                            <div className="info-card card-primary border-l-4 border-l-blue-500">
                                <h3>Dinheiro na Gaveta (Atual)</h3>
                                <div className="value">{formatCurrency(sessaoData?.saldo_atual || 0)}</div>
                                <p className="text-sm text-gray-500 mt-2">Saldo Inicial: {formatCurrency(sessaoData?.saldo_inicial || 0)}</p>
                            </div>
                            
                            <div className="info-card border-l-4 border-l-green-400">
                                <h3>Vendas no PIX (Hoje)</h3>
                                <div className="value text-green-600">{formatCurrency(sessaoData?.totais?.vendas_pix || 0)}</div>
                            </div>

                            <div className="info-card border-l-4 border-l-purple-400">
                                <h3>Vendas no Cartão (Hoje)</h3>
                                <div className="value text-purple-600">{formatCurrency(sessaoData?.totais?.vendas_cartao || 0)}</div>
                            </div>

                             <div className="info-card border-l-4 border-l-orange-400">
                                <h3>Total Saídas (Dinheiro)</h3>
                                <div className="value text-orange-600">{formatCurrency(sessaoData?.totais?.saidas_dinheiro || 0)}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="actions-bar">
                             <button className="btn-action btn-sangria" onClick={() => setShowSangria(true)}>
                                <TrendingDown size={24} /> Sangria (Retirada)
                             </button>
                             <button className="btn-action btn-suprimento" onClick={() => setShowSuprimento(true)}>
                                <TrendingUp size={24} /> Suprimento (Entrada)
                             </button>
                        </div>

                        {/* Extrato Table */}
                        <div className="extrato-section">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-700">Extrato de Movimentações (Sessão Atual)</h3>
                                <button className="btn-fechar-caixa shadow-lg hover:shadow-xl transition-all" onClick={() => setShowFechar(true)}>
                                    Fechar Caixa
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                            <table className="extrato-table">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Forma</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        // Sort reverse chronological
                                        const allMovs = sessaoData?.movimentacoes
                                            ? [...sessaoData.movimentacoes].sort((a: any, b: any) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
                                            : []
                                        
                                        // Pagination
                                        const totalPages = Math.ceil(allMovs.length / itemsPerPage)
                                        const currentMovs = allMovs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        
                                        return currentMovs.length > 0 ? (
                                            currentMovs.map((mov: any) => (
                                                <tr key={mov.id}>
                                                    <td>{new Date(mov.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</td>
                                                    <td>
                                                        <span className={`font-semibold px-2 py-1 rounded text-xs ${
                                                            mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' :
                                                            mov.tipo === 'SUPRIMENTO' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {mov.tipo}
                                                        </span>
                                                    </td>
                                                    <td>{mov.descricao || '-'}</td>
                                                    <td className={
                                                        (mov.tipo === 'SAIDA' || mov.tipo === 'SANGRIA') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
                                                    }>
                                                        {formatCurrency(mov.valor)}
                                                    </td>
                                                    <td>{mov.forma_pagamento}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center text-gray-500 py-4">Nenhuma movimentação registrada.</td>
                                            </tr>
                                        )
                                    })()}
                                </tbody>
                            </table>
                            </div>

                            {/* Pagination */}
                            {sessaoData?.movimentacoes && sessaoData.movimentacoes.length > 0 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(sessaoData.movimentacoes.length / itemsPerPage)}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ModalMovimentacao 
                isOpen={showSangria} 
                onClose={() => setShowSangria(false)} 
                tipo="SANGRIA" 
                onConfirm={(v, d) => handleMovimentacao('SANGRIA', v, d)}
            />
            <ModalMovimentacao 
                isOpen={showSuprimento} 
                onClose={() => setShowSuprimento(false)} 
                tipo="SUPRIMENTO" 
                onConfirm={(v, d) => handleMovimentacao('SUPRIMENTO', v, d)}
            />
            <ModalFecharCaixa 
                isOpen={showFechar} 
                onClose={() => setShowFechar(false)} 
                saldoSistema={sessaoData?.saldo_atual || 0}
                onConfirm={handleFecharCaixa}
            />

        </div>
    )
}
