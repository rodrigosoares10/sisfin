'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'
import { CentroCustoComStats } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface MetaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (centroCustoId: string, valor: number, mes: number, ano: number) => Promise<void>
  centroCusto: CentroCustoComStats | null
}

export default function MetaModal({
  isOpen,
  onClose,
  onSave,
  centroCusto,
}: MetaModalProps) {
  const [valor, setValor] = useState('')
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (centroCusto?.metaMensal) {
      setValor(centroCusto.metaMensal.toString())
    } else {
      setValor('')
    }
    setMes(new Date().getMonth() + 1)
    setAno(new Date().getFullYear())
    setErrors({})
  }, [centroCusto, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const valorNum = parseFloat(valor)
    if (!valor || isNaN(valorNum) || valorNum <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero'
    }

    if (mes < 1 || mes > 12) {
      newErrors.mes = 'Mês inválido'
    }

    if (ano < 2000 || ano > 2100) {
      newErrors.ano = 'Ano inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !centroCusto) return

    setIsLoading(true)
    try {
      await onSave(centroCusto.id, parseFloat(valor), mes, ano)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Definir Meta Mensal"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {centroCusto && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: centroCusto.cor }}
              />
              <span className="font-medium text-gray-900">{centroCusto.nome}</span>
            </div>
            <p className="text-sm text-gray-600">
              Gasto atual: <span className="font-semibold">{formatCurrency(centroCusto.totalGasto)}</span>
            </p>
          </div>
        )}

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Mês *
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
            >
              {meses.map((nome, idx) => (
                <option key={idx} value={idx + 1}>
                  {nome}
                </option>
              ))}
            </select>
            {errors.mes && <p className="text-sm text-red-600">{errors.mes}</p>}
          </div>

          <Input
            label="Ano *"
            type="number"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            min={2000}
            max={2100}
            error={errors.ano}
          />
        </div>

        {/* Valor */}
        <Input
          label="Valor da Meta *"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          error={errors.valor}
        />

        {/* Preview do valor formatado */}
        {valor && !isNaN(parseFloat(valor)) && (
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-800">
              Meta: <span className="font-bold text-lg">{formatCurrency(parseFloat(valor))}</span>
            </p>
          </div>
        )}

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
            Salvar Meta
          </Button>
        </div>
      </form>
    </Modal>
  )
}
