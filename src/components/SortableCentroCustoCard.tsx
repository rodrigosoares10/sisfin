'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Target } from 'lucide-react'
import CentroCustoCard from './CentroCustoCard'
import { CentroCustoComStats } from '@/types'
import Button from './Button'

interface SortableCentroCustoCardProps {
  centroCusto: CentroCustoComStats
  onEdit: (centroCusto: CentroCustoComStats) => void
  onToggleStatus: (id: string, ativo: boolean) => void
  onDefinirMeta: (centroCusto: CentroCustoComStats) => void
}

export default function SortableCentroCustoCard({
  centroCusto,
  onEdit,
  onToggleStatus,
  onDefinirMeta,
}: SortableCentroCustoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: centroCusto.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10"
      >
        <div className="bg-white rounded-lg shadow-md p-2 border border-gray-200">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Card */}
      <div className={isDragging ? 'opacity-50' : ''}>
        <CentroCustoCard
          centroCusto={centroCusto}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          isDragging={isDragging}
        />

        {/* Botão de Meta */}
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDefinirMeta(centroCusto)}
            className="w-full"
          >
            <Target className="w-4 h-4 mr-2" />
            {centroCusto.metaMensal ? 'Editar Meta' : 'Definir Meta'}
          </Button>
        </div>
      </div>
    </div>
  )
}
