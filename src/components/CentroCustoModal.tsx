'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'
import Input from './Input'
import ColorPicker from './ColorPicker'
import Switch from './Switch'
import Button from './Button'
import { CentroCustoComStats, CreateCentroCustoInput } from '@/types'

interface CentroCustoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateCentroCustoInput) => Promise<void>
  centroCusto?: CentroCustoComStats | null
}

export default function CentroCustoModal({
  isOpen,
  onClose,
  onSave,
  centroCusto,
}: CentroCustoModalProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cor, setCor] = useState('#3B82F6')
  const [ativo, setAtivo] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher form quando editar
  useEffect(() => {
    if (centroCusto) {
      setNome(centroCusto.nome)
      setDescricao(centroCusto.descricao || '')
      setCor(centroCusto.cor)
      setAtivo(centroCusto.ativo)
    } else {
      // Limpar form para novo
      setNome('')
      setDescricao('')
      setCor('#3B82F6')
      setAtivo(true)
    }
    setErrors({})
  }, [centroCusto, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!cor.match(/^#[0-9A-F]{6}$/i)) {
      newErrors.cor = 'Cor inválida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    try {
      await onSave({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        cor,
        ativo,
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={centroCusto ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <Input
          label="Nome *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Vendas, Marketing, TI..."
          error={errors.nome}
          maxLength={100}
        />

        {/* Descrição */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição opcional do centro de custo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors duration-200"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Cor */}
        <ColorPicker
          label="Cor *"
          value={cor}
          onChange={setCor}
        />

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Status</p>
            <p className="text-sm text-gray-500">
              {ativo ? 'Centro de custo ativo' : 'Centro de custo inativo'}
            </p>
          </div>
          <Switch
            checked={ativo}
            onChange={setAtivo}
          />
        </div>

        {/* Prévia */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Prévia:</p>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: cor }}
            />
            <span className="font-medium text-gray-900">{nome || 'Nome do centro'}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {centroCusto ? 'Salvar Alterações' : 'Criar Centro de Custo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
