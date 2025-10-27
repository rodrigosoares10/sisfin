'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Target } from 'lucide-react'
import { CentroCustoComStats, CreateCentroCustoInput } from '@/types'
import Button from '@/components/Button'
import CentroCustoModal from '@/components/CentroCustoModal'
import MetaModal from '@/components/MetaModal'
import SortableCentroCustoCard from '@/components/SortableCentroCustoCard'
import { ToastContainer, ToastProps } from '@/components/Toast'
import { formatCurrency } from '@/lib/utils'

export default function CentrosCustoPage() {
  const [centrosCusto, setCentrosCusto] = useState<CentroCustoComStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [centroCustoEditando, setCentroCustoEditando] = useState<CentroCustoComStats | null>(null)
  const [centroCustoMeta, setCentroCustoMeta] = useState<CentroCustoComStats | null>(null)
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Carregar centros de custo
  const loadCentrosCusto = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/centros-custo')
      if (!response.ok) throw new Error('Erro ao carregar')
      const data = await response.json()
      setCentrosCusto(data)
    } catch (error) {
      addToast('Erro ao carregar centros de custo', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCentrosCusto()
  }, [])

  // Toast helper
  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type, onClose: removeToast }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Criar ou atualizar centro de custo
  const handleSave = async (data: CreateCentroCustoInput) => {
    try {
      if (centroCustoEditando) {
        // Atualizar
        const response = await fetch(`/api/centros-custo/${centroCustoEditando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Erro ao atualizar')

        addToast('Centro de custo atualizado com sucesso', 'success')
      } else {
        // Criar
        const response = await fetch('/api/centros-custo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Erro ao criar')

        addToast('Centro de custo criado com sucesso', 'success')
      }

      await loadCentrosCusto()
      setIsModalOpen(false)
      setCentroCustoEditando(null)
    } catch (error) {
      addToast('Erro ao salvar centro de custo', 'error')
      throw error
    }
  }

  // Alternar status ativo/inativo
  const handleToggleStatus = async (id: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/centros-custo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      addToast(
        ativo ? 'Centro de custo ativado' : 'Centro de custo desativado',
        'success'
      )
      await loadCentrosCusto()
    } catch (error) {
      addToast('Erro ao atualizar status', 'error')
    }
  }

  // Drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = centrosCusto.findIndex((cc) => cc.id === active.id)
    const newIndex = centrosCusto.findIndex((cc) => cc.id === over.id)

    const newOrder = arrayMove(centrosCusto, oldIndex, newIndex)
    setCentrosCusto(newOrder)

    // Atualizar ordem no backend
    try {
      const reordenacao = newOrder.map((cc, index) => ({
        id: cc.id,
        ordem: index,
      }))

      const response = await fetch('/api/centros-custo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reordenacao }),
      })

      if (!response.ok) throw new Error('Erro ao reordenar')

      addToast('Ordem atualizada com sucesso', 'success')
    } catch (error) {
      addToast('Erro ao reordenar centros de custo', 'error')
      // Reverter mudança em caso de erro
      await loadCentrosCusto()
    }
  }

  // Salvar meta
  const handleSaveMeta = async (
    centroCustoId: string,
    valor: number,
    mes: number,
    ano: number
  ) => {
    try {
      const response = await fetch(`/api/centros-custo/${centroCustoId}/meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, mes, ano }),
      })

      if (!response.ok) throw new Error('Erro ao salvar meta')

      addToast('Meta definida com sucesso', 'success')
      await loadCentrosCusto()
      setIsMetaModalOpen(false)
      setCentroCustoMeta(null)
    } catch (error) {
      addToast('Erro ao salvar meta', 'error')
      throw error
    }
  }

  // Calcular totais
  const totalGeral = centrosCusto.reduce((acc, cc) => acc + cc.totalGasto, 0)
  const totalAtivos = centrosCusto.filter((cc) => cc.ativo).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestão de Centros de Custo
              </h1>
              <p className="text-gray-600 mt-1">
                {totalAtivos} centro{totalAtivos !== 1 ? 's' : ''} ativo{totalAtivos !== 1 ? 's' : ''} • Total gasto: {formatCurrency(totalGeral)}
              </p>
            </div>
            <Button
              onClick={() => {
                setCentroCustoEditando(null)
                setIsModalOpen(true)
              }}
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Centro de Custo
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : centrosCusto.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum centro de custo cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro centro de custo para organizar suas despesas.
            </p>
            <Button
              onClick={() => {
                setCentroCustoEditando(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeiro Centro de Custo
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={centrosCusto.map((cc) => cc.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centrosCusto.map((centroCusto) => (
                  <SortableCentroCustoCard
                    key={centroCusto.id}
                    centroCusto={centroCusto}
                    onEdit={(cc) => {
                      setCentroCustoEditando(cc)
                      setIsModalOpen(true)
                    }}
                    onToggleStatus={handleToggleStatus}
                    onDefinirMeta={(cc) => {
                      setCentroCustoMeta(cc)
                      setIsMetaModalOpen(true)
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Modals */}
      <CentroCustoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setCentroCustoEditando(null)
        }}
        onSave={handleSave}
        centroCusto={centroCustoEditando}
      />

      <MetaModal
        isOpen={isMetaModalOpen}
        onClose={() => {
          setIsMetaModalOpen(false)
          setCentroCustoMeta(null)
        }}
        onSave={handleSaveMeta}
        centroCusto={centroCustoMeta}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
