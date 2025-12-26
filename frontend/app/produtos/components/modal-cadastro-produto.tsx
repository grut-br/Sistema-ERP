import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Camera } from "lucide-react"
import { ModalNovaCategoria } from "./modal-nova-categoria"
import { ModalNovoFabricante } from "./modal-novo-fabricante"

interface ModalCadastroProdutoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  produtoParaEditar?: any
}

export const ModalCadastroProduto = ({ isOpen, onClose, onSuccess, produtoParaEditar }: ModalCadastroProdutoProps) => {
  const { toast } = useToast()
  
  // Local state for dropdowns
  const [categorias, setCategorias] = useState<any[]>([])
  const [fabricantes, setFabricantes] = useState<any[]>([])

  // Sub-modals state
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showNewFabricanteModal, setShowNewFabricanteModal] = useState(false)

  const [formData, setFormData] = useState({
    nome: "",
    idCategoria: "",
    idFabricante: "",
    status: "ATIVO",
    precoVenda: "",
    estoqueMinimo: "",
    codigoBarras: "",
    manterDados: false
  })

  // Fetch dropdown data
  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (response.ok) setCategorias(await response.json())
    } catch (e) {
      console.error(e)
    }
  }

  const fetchFabricantes = async () => {
    try {
      const response = await fetch('/api/fabricantes')
      if (response.ok) setFabricantes(await response.json())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategorias()
      fetchFabricantes()
    }
  }, [isOpen])

  // Effect to populate form when editing
  useEffect(() => {
    if (produtoParaEditar) {
      const p = produtoParaEditar
      setFormData({
        nome: p.nome || "",
        idCategoria: p.idCategoria || p.categoria?.id || "",
        idFabricante: p.idFabricante || p.fabricante?.id || "",
        status: p.status || "ATIVO",
        precoVenda: p.precoVenda ? String(p.precoVenda).replace('.', ',') : "",
        estoqueMinimo: p.estoqueMinimo ? String(p.estoqueMinimo) : "",
        codigoBarras: p.codigoBarras || "",
        manterDados: false
      })
    } else {
      // Reset logic handled partially by parent closing, but good to be explicit for "New"
      if (!isOpen) { // Reset when closing? No, reset when opening as new.
         // Handled below or by parent passing null
      }
    }
  }, [produtoParaEditar, isOpen])

  // Reset form when opening as CREATE (produtoParaEditar is null)
  useEffect(() => {
    if (isOpen && !produtoParaEditar) {
      setFormData({
        nome: "",
        idCategoria: "",
        idFabricante: "",
        status: "ATIVO",
        precoVenda: "",
        estoqueMinimo: "",
        codigoBarras: "",
        manterDados: false
      })
    }
  }, [isOpen, produtoParaEditar])


  const handleSave = async () => {
    try {
      if (!formData.nome || !formData.precoVenda || !formData.idCategoria) {
        toast({ title: "Erro", description: "Preencha os campos obrigatórios (Nome, Categoria, Preço).", variant: "destructive" })
        return
      }

      const payload = {
        nome: formData.nome,
        idCategoria: Number(formData.idCategoria),
        idFabricante: Number(formData.idFabricante),
        status: formData.status,
        precoVenda: Number(formData.precoVenda.replace(',', '.')),
        estoqueMinimo: Number(formData.estoqueMinimo),
        codigoBarras: formData.codigoBarras,
      }

      let response;
      if (produtoParaEditar) {
        // Edit Mode (PUT)
        response = await fetch(`/api/produtos/${produtoParaEditar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create Mode (POST)
        response = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!response.ok) throw new Error('Falha ao salvar produto')

      toast({ title: "Sucesso", description: `Produto ${produtoParaEditar ? 'atualizado' : 'cadastrado'} com sucesso.` })
      onSuccess()

      if (!produtoParaEditar && formData.manterDados) {
        // Only valid for creation mode
        setFormData(prev => ({ ...prev, codigoBarras: "" }))
      } else {
        onClose()
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Erro ao salvar produto.", variant: "destructive" })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-produtos">
          <h2>{produtoParaEditar ? "Editar Produto" : "Cadastro de Itens"}</h2>
        </div>

        <div className="modal-body space-y-6">
          {/* Linha Superior: Dados Básicos */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 form-field">
              <label>Nome *</label>
              <input 
                type="text" 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                autoFocus
                className="w-full"
              />
            </div>
            <div className="col-span-4 form-field">
              <label>Código de Barras</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.codigoBarras}
                  onChange={e => setFormData({...formData, codigoBarras: e.target.value})}
                  className="flex-1"
                />
                <button className="btn-ler-codigo">Ler código</button>
              </div>
            </div>
          </div>

          {/* Linha Central: Dados Técnicos + Imagem */}
          <div className="grid grid-cols-12 gap-4">
            {/* Bloco Esquerda */}
            <div className="col-span-8 grid grid-cols-2 gap-4">
              <div className="col-span-1 form-field">
                <label>Categoria *</label>
                <div className="flex gap-2">
                  <select 
                    value={formData.idCategoria}
                    onChange={e => setFormData({...formData, idCategoria: e.target.value})}
                    className="flex-1"
                  >
                    <option value="">Selecionar</option>
                    {categorias.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                  <button 
                    className="btn-add-categoria"
                    onClick={() => setShowNewCategoryModal(true)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-span-1 form-field">
                <label>Fabricante</label>
                 <div className="flex gap-2">
                  <select 
                    value={formData.idFabricante}
                    onChange={e => setFormData({...formData, idFabricante: e.target.value})}
                    className="flex-1"
                  >
                    <option value="">Selecionar</option>
                    {fabricantes.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                  <button 
                    className="btn-add-categoria"
                    onClick={() => setShowNewFabricanteModal(true)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-span-2 form-field">
                <label>Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full"
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </div>
            </div>

            {/* Bloco Direita (Imagem) */}
            <div className="col-span-4">
               <div className="h-full flex items-center justify-center border-2 dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-emerald-500 transition-colors">
                <Camera size={48} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Linha Inferior: Valores */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 form-field">
              <label>Preço Venda *</label>
              <input 
                type="number" 
                placeholder="0,00"
                value={formData.precoVenda}
                onChange={e => setFormData({...formData, precoVenda: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="col-span-6 form-field">
              <label>Estoque Mínimo</label>
              <input 
                type="number" 
                value={formData.estoqueMinimo}
                onChange={e => setFormData({...formData, estoqueMinimo: e.target.value})}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             {!produtoParaEditar && (
                <>
                <input 
                  type="checkbox" 
                  id="manterDados"
                  checked={formData.manterDados}
                  onChange={e => setFormData({...formData, manterDados: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="manterDados" style={{ margin: 0, fontWeight: 500 }}>Salvar e Manter dados</label>
                </>
             )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-save" onClick={handleSave}>
              {produtoParaEditar ? "Salvar Alterações" : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      <ModalNovaCategoria 
        isOpen={showNewCategoryModal}
        onClose={() => setShowNewCategoryModal(false)}
        onSuccess={fetchCategorias}
      />

       <ModalNovoFabricante
        isOpen={showNewFabricanteModal}
        onClose={() => setShowNewFabricanteModal(false)}
        onSuccess={fetchFabricantes}
      />
    </div>
  )
}
