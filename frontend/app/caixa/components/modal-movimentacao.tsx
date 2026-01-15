import { useState } from "react";
import { X } from "lucide-react";

interface ModalMovimentacaoProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (valor: number, descricao: string) => Promise<void>;
    tipo: 'SANGRIA' | 'SUPRIMENTO';
}

export function ModalMovimentacao({ isOpen, onClose, onConfirm, tipo }: ModalMovimentacaoProps) {
    const [valor, setValor] = useState("");
    const [descricao, setDescricao] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numValor = parseFloat(valor.replace(',', '.'));
        if (!numValor || numValor <= 0) return;

        setIsLoading(true);
        try {
            await onConfirm(numValor, descricao);
            setValor("");
            setDescricao("");
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const colorClass = tipo === 'SANGRIA' ? 'text-red-600' : 'text-green-600';
    const title = tipo === 'SANGRIA' ? 'Realizar Sangria (Retirada)' : 'Realizar Suprimento (Entrada)';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className={`text-xl font-bold mb-4 ${colorClass}`}>{title}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={valor}
                            onChange={e => setValor(e.target.value)}
                            placeholder="0,00"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Motivo</label>
                        <textarea
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder={tipo === 'SANGRIA' ? "Ex: Pagamento de fornecedor" : "Ex: Troco inicial extra"}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white rounded-md font-medium ${tipo === 'SANGRIA' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Confirmando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
