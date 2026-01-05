'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface ModalCadastroClienteProps {
  isOpen: boolean
  onClose: () => void
  cliente: any | null
  onSuccess: () => void
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

const initialEnderecoState = {
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
  const [endereco, setEndereco] = useState(initialEnderecoState)
  const [incluirEndereco, setIncluirEndereco] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBuscandoCep, setIsBuscandoCep] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      // Limpar erros ao abrir
      setErrors({})
      setTouched({})
      
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
        setIncluirEndereco(false)
        setEndereco(initialEnderecoState)
      } else {
        setFormData(initialFormState)
        setEndereco(initialEnderecoState)
        setIncluirEndereco(false)
      }
    }
  }, [isOpen, cliente])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validar campo específico ao sair
    if (field === 'nome' && !formData.nome.trim()) {
      setErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }))
    } else if (field === 'nome' && formData.nome.trim()) {
      setErrors(prev => ({ ...prev, nome: undefined }))
    }
    
    if (field === 'telefone' && !formData.telefone.trim()) {
      setErrors(prev => ({ ...prev, telefone: 'Telefone é obrigatório' }))
    } else if (field === 'telefone' && formData.telefone.trim()) {
      setErrors(prev => ({ ...prev, telefone: undefined }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro ao digitar
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEndereco(prev => ({ ...prev, [name]: value }))
  }

  // Buscar CEP via ViaCEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setIsBuscandoCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setEndereco(prev => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos os campos obrigatórios como tocados
    setTouched({ nome: true, telefone: true })
    
    if (!validateForm()) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    
    try {
      const url = cliente ? `/api/clientes/${cliente.id}` : '/api/clientes'
      const method = cliente ? 'PUT' : 'POST'
      
      // Monta payload com endereço opcional
      const payload: any = {
        ...formData,
        limiteFiado: Number(formData.limiteFiado)
      }

      // Adiciona endereço apenas se marcado e for criação
      if (!cliente && incluirEndereco && endereco.logradouro) {
        payload.endereco = endereco
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

  // Formatação CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    setFormData(prev => ({ ...prev, cpf: value }))
  }

  // Formatação Telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
    }
    setFormData(prev => ({ ...prev, telefone: value }))
    
    // Limpar erro ao digitar
    if (errors.telefone && value.trim()) {
      setErrors(prev => ({ ...prev, telefone: undefined }))
    }
  }

  // Formatação CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2')
    }
    setEndereco(prev => ({ ...prev, cep: value }))
    
    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value)
    }
  }

  // Helper para classes de input com erro
  const getInputClass = (field: keyof FormErrors) => {
    const baseClass = "w-full p-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
    const hasError = errors[field] && touched[field]
    
    return `${baseClass} ${
      hasError 
        ? 'border-red-500 bg-red-50 focus:ring-red-500' 
        : 'border-gray-300 focus:ring-emerald-500'
    }`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
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
                  name="cpf"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telefone"
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
              
              <div>
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
            <div className="grid grid-cols-2 gap-4">
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

          {/* Endereço (apenas para criação) */}
          {!cliente && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="incluirEndereco"
                  checked={incluirEndereco}
                  onChange={(e) => setIncluirEndereco(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="incluirEndereco" className="text-sm font-semibold text-gray-500 uppercase cursor-pointer">
                  Cadastrar Endereço Principal
                </label>
              </div>

              {incluirEndereco && (
                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      name="cep"
                      value={endereco.cep}
                      onChange={handleCepChange}
                      maxLength={9}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="00000-000"
                    />
                    {isBuscandoCep && <span className="text-xs text-gray-500">Buscando...</span>}
                  </div>
                  
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                    <input
                      type="text"
                      name="logradouro"
                      value={endereco.logradouro}
                      onChange={handleEnderecoChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={endereco.numero}
                      onChange={handleEnderecoChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="123"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      name="bairro"
                      value={endereco.bairro}
                      onChange={handleEnderecoChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Bairro"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={endereco.cidade}
                      onChange={handleEnderecoChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Cidade"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
