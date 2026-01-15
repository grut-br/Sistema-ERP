import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ModalFecharCaixaProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (saldoInformado: number) => Promise<void>;
    saldoSistema: number; // To show if we want, or keep blind? Requirement says "O valor contado pelo usuário". Usually blind or comparative. Let's make it blind input but maybe show system diff after?
    // Requirement: "Abre modal de conferência". 
}

export function ModalFecharCaixa({ isOpen, onClose, onConfirm, saldoSistema }: ModalFecharCaixaProps) {
    const [valor, setValor] = useState("");
    const [diferenca, setDiferenca] = useState<number | null>(null);
    const [step, setStep] = useState(1); // 1: Input, 2: Confirm Diff (if any)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(isOpen) {
            setValor("");
            setDiferenca(null);
            setStep(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        const numValor = parseFloat(valor.replace(',', '.'));
        if (isNaN(numValor)) return;

        const diff = numValor - saldoSistema;
        console.log(`Sistema: ${saldoSistema}, Informado: ${numValor}, Diff: ${diff}`);
        
        // If absolutely perfect (rare with floats, use epsilon), or user wants to proceed anyway.
        // Let's just always show the comparison for safety before final commit? 
        // Or commit directly? 
        // "Recebe saldo_informado. O sistema calcula ... compara e salva." - Backend does saving. 
        // Frontend interaction: Input -> Confirm -> Call Backend. 
        
        // I will implement a client-side pre-check for UX, but final logic is backend.
        setDiferenca(diff);
        setStep(2);
    };

    const handleFinalConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(parseFloat(valor));
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 text-gray-800">Fechar Caixa</h2>

                {step === 1 ? (
                    <form onSubmit={handleNext}>
                        <p className="text-gray-600 mb-4">Por favor, conte o dinheiro físico na gaveta e informe o valor total.</p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor em Dinheiro (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-2xl font-bold text-center"
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                                placeholder="0,00"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
                             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Conferir</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className={`p-4 rounded-md mb-6 ${diferenca === 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                            {diferenca === 0 ? (
                                <p className="text-green-700 font-medium flex items-center gap-2">
                                    <span className="text-xl">✅</span> O valor confere exatamente com o sistema.
                                </p>
                            ) : (
                                <div className="text-amber-800">
                                    <p className="font-bold flex items-center gap-2 mb-2">
                                        <AlertTriangle size={20} /> Divergência Detectada
                                    </p>
                                    <p>Informado: <b>{formatCurrency(parseFloat(valor))}</b></p>
                                    <p>Sistema: <b>{formatCurrency(saldoSistema)}</b></p>
                                    <p className={`font-bold mt-2 ${diferenca! > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Diferença: {diferenca! > 0 ? '+' : ''}{formatCurrency(diferenca!)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Ao confirmar, o caixa será fechado e o saldo reiniciado.</p>
                        
                         <div className="flex justify-end gap-2">
                             <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Voltar</button>
                             <button 
                                onClick={handleFinalConfirm} 
                                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black font-medium"
                                disabled={isLoading}
                             >
                                {isLoading ? 'Fechando...' : 'Confirmar Fechamento'}
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
