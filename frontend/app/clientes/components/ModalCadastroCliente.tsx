'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Plus, Trash2, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface ModalCadastroClienteProps {
  isOpen: boolean
  onClose: () => void
  cliente: any | null
  onSuccess: () => void
}

interface Endereco {
  id?: number
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  titulo: string
}

const initialFormState = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  genero: '',
  limiteFiado: 0
}

const initialEnderecoState: Endereco = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  titulo: 'Principal'
}

interface FormErrors {
  nome?: string
  telefone?: string
}

export function ModalCadastroCliente({ isOpen, onClose, cliente, onSuccess }: ModalCadastroClienteProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(initialFormState)
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [novoEndereco, setNovoEndereco] = useState(initialEnderecoState)
  const [showEnderecoForm, setShowEnderecoForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBuscandoCep, setIsBuscandoCep] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setTouched({})
      setShowEnderecoForm(false)
      setNovoEndereco(initialEnderecoState)
      
      if (cliente) {
        setFormData({
          nome: cliente.nome || '',
          cpf: cliente.cpf || '',
          dataNascimento: cliente.dataNascimento ? cliente.dataNascimento.split('T')[0] : '',
          telefone: cliente.telefone || '',
          email: cliente.email || '',
          genero: cliente.genero || '',
          limiteFiado: cliente.limiteFiado || 0
        })
        // Buscar endereços do cliente
        fetchEnderecos(cliente.id)
      } else {
        setFormData(initialFormState)
        setEnderecos([])
      }
    }
  }, [isOpen, cliente])

  const fetchEnderecos = async (clienteId: number) => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}/enderecos`)
      if (res.ok) {
        setEnderecos(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'nome' && !formData.nome.trim()) {
      setErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }))
    } else if (field === 'nome') {
      setErrors(prev => ({ ...prev, nome: undefined }))
    }
    if (field === 'telefone' && !formData.telefone.trim()) {
      setErrors(prev => ({ ...prev, telefone: 'Telefone é obrigatório' }))
    } else if (field === 'telefone') {
      setErrors(prev => ({ ...prev, telefone: undefined }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setIsBuscandoCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      if (!data.erro) {
        setNovoEndereco(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado
        }))
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e)
    } finally {
      setIsBuscandoCep(false)
    }
  }

  const handleAddEndereco = async () => {
    if (!novoEndereco.logradouro) {
      toast({ title: "Erro", description: "Preencha o logradouro", variant: "destructive" })
      return
    }

    if (cliente) {
      // Modo edição: salvar no backend
      try {
        const res = await fetch(`/api/clientes/${cliente.id}/enderecos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoEndereco)
        })
        if (res.ok) {
          const endSalvo = await res.json()
          setEnderecos(prev => [...prev, endSalvo])
          setNovoEndereco(initialEnderecoState)
          setShowEnderecoForm(false)
          toast({ title: "Sucesso", description: "Endereço adicionado!" })
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      // Modo criação: adicionar na lista local
      setEnderecos(prev => [...prev, { ...novoEndereco, id: Date.now() }])
      setNovoEndereco(initialEnderecoState)
      setShowEnderecoForm(false)
    }
  }

  const handleDeleteEndereco = async (endereco: Endereco) => {
    if (cliente && endereco.id) {
      // Modo edição: deletar no backend
      try {
        const res = await fetch(`/api/clientes/${cliente.id}/enderecos/${endereco.id}`, { method: 'DELETE' })
        if (res.ok) {
          setEnderecos(prev => prev.filter(e => e.id !== endereco.id))
          toast({ title: "Sucesso", description: "Endereço removido!" })
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      // Modo criação: remover da lista local
      setEnderecos(prev => prev.filter(e => e.id !== endereco.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ nome: true, telefone: true })
    if (!validateForm()) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const url = cliente ? `/api/clientes/${cliente.id}` : '/api/clientes'
      const method = cliente ? 'PUT' : 'POST'
      
      const payload: any = { ...formData, limiteFiado: Number(formData.limiteFiado) }
      
      // Se for novo cliente e tiver endereços, enviar o primeiro
      if (!cliente && enderecos.length > 0) {
        payload.endereco = enderecos[0]
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        onSuccess()
      } else {
        const err = await response.json()
        toast({ title: "Erro", description: err.error || "Falha ao salvar cliente", variant: "destructive" })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Erro", description: "Erro de conexão", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    setFormData(prev => ({ ...prev, cpf: value }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
    }
    setFormData(prev => ({ ...prev, telefone: value }))
    if (errors.telefone && value.trim()) setErrors(prev => ({ ...prev, telefone: undefined }))
  }

  const handleCepChange = (value: string) => {
    let v = value.replace(/\D/g, '')
    if (v.length <= 8) v = v.replace(/(\d{5})(\d)/, '$1-$2')
    setNovoEndereco(prev => ({ ...prev, cep: v }))
    if (v.replace(/\D/g, '').length === 8) buscarCep(v)
  }

  const getInputClass = (field: keyof FormErrors) => {
    const base = "w-full p-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
    const hasError = errors[field] && touched[field]
    return `${base} ${hasError ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  onBlur={() => handleBlur('nome')}
                  className={getInputClass('nome')}
                  placeholder="Nome completo"
                />
                {errors.nome && touched.nome && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.nome}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                  <option value="NAO_INFORMAR">Prefiro não informar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Contato</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('telefone')}
                  maxLength={15}
                  className={getInputClass('telefone')}
                  placeholder="(00) 00000-0000"
                />
                {errors.telefone && touched.telefone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.telefone}
                  </p>
                )}
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Financeiro</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limite Fiado (R$)</label>
                <input
                  type="number"
                  name="limiteFiado"
                  value={formData.limiteFiado}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Endereços */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                <MapPin size={16} />
                Endereços
              </h3>
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                onClick={() => setShowEnderecoForm(!showEnderecoForm)}
              >
                <Plus size={16} />
                Adicionar Endereço
              </button>
            </div>

            {/* Form de novo endereço */}
            {showEnderecoForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Título (ex: Casa)"
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.titulo}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, titulo: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="CEP"
                      maxLength={9}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                    />
                    {isBuscandoCep && <span className="text-xs text-gray-500">Buscando...</span>}
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Logradouro"
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.logradouro}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="Nº"
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.numero}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, numero: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Complemento (Apto, Bloco, etc.)"
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.complemento}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Bairro"
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.bairro}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Cidade"
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      value={novoEndereco.cidade}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="UF"
                      maxLength={2}
                      className="w-full p-2 text-sm border border-gray-300 rounded uppercase"
                      value={novoEndereco.estado}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    onClick={() => { setShowEnderecoForm(false); setNovoEndereco(initialEnderecoState) }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    onClick={handleAddEndereco}
                  >
                    Salvar Endereço
                  </button>
                </div>
              </div>
            )}

            {/* Lista de endereços */}
            {enderecos.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum endereço cadastrado</p>
            ) : (
              <div className="space-y-2">
                {enderecos.map((end, idx) => (
                  <div key={end.id || idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{end.titulo || 'Endereço'}</p>
                      <p className="text-sm text-gray-600">
                        {end.logradouro}, {end.numero}
                        {end.complemento && ` - ${end.complemento}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {end.bairro} - {end.cidade}/{end.estado} {end.cep && `| CEP: ${end.cep}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => handleDeleteEndereco(end)}
                      title="Remover endereço"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
