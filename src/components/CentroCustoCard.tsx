'use client'

import { Edit2, Power, TrendingUp } from 'lucide-react'
import { Card, CardContent } from './Card'
import { CentroCustoComStats } from '@/types'
import { formatCurrency, formatPercentage, getContrastColor } from '@/lib/utils'
import Button from './Button'

interface CentroCustoCardProps {
  centroCusto: CentroCustoComStats
  onEdit: (centroCusto: CentroCustoComStats) => void
  onToggleStatus: (id: string, ativo: boolean) => void
  isDragging?: boolean
}

export default function CentroCustoCard({
  centroCusto,
  onEdit,
  onToggleStatus,
  isDragging,
}: CentroCustoCardProps) {
  const textColor = getContrastColor(centroCusto.cor)

  return (
    <Card
      className={`
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg cursor-move'}
        ${!centroCusto.ativo && 'opacity-60'}
      `}
    >
      {/* Header com cor */}
      <div
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: centroCusto.cor }}
      />

      <CardContent className="space-y-4">
        {/* Título e ações */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: centroCusto.cor }}
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {centroCusto.nome}
              </h3>
            </div>
            {centroCusto.descricao && (
              <p className="text-sm text-gray-500 mt-1">
                {centroCusto.descricao}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(centroCusto)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleStatus(centroCusto.id, !centroCusto.ativo)}
              className={`
                p-2 rounded-lg transition-colors
                ${centroCusto.ativo
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }
              `}
              title={centroCusto.ativo ? 'Desativar' : 'Ativar'}
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-3">
          {/* Total gasto */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-gray-600">Total gasto</span>
              <span className="text-xs text-gray-500">
                {formatPercentage(centroCusto.porcentagemTotal)} do total
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(centroCusto.totalGasto)}
            </div>
          </div>

          {/* Barra de progresso do total */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(centroCusto.porcentagemTotal, 100)}%`,
                backgroundColor: centroCusto.cor,
              }}
            />
          </div>

          {/* Meta (se existir) */}
          {centroCusto.metaMensal && centroCusto.progressoMeta !== undefined && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Meta mensal</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(centroCusto.metaMensal)}
                </span>
              </div>

              {/* Barra de progresso da meta */}
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(centroCusto.progressoMeta, 100)}%`,
                      backgroundColor:
                        centroCusto.progressoMeta > 100
                          ? '#EF4444' // Red if over budget
                          : centroCusto.progressoMeta > 80
                          ? '#F59E0B' // Amber if close
                          : '#10B981', // Green if ok
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {formatPercentage(centroCusto.progressoMeta)} utilizado
                  </span>
                  {centroCusto.progressoMeta > 100 && (
                    <span className="text-red-600 font-medium">
                      +{formatCurrency(centroCusto.totalGasto - centroCusto.metaMensal)} acima
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
