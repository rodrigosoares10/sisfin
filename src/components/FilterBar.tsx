'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { DateFilter } from '@/types'

interface FilterBarProps {
  onFilterChange?: (filter: DateFilter) => void
}

const filters: { value: DateFilter; label: string }[] = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'year', label: 'Ano' },
  { value: 'custom', label: 'Customizado' }
]

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [activeFilter, setActiveFilter] = useState<DateFilter>('month')
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (filter: DateFilter) => {
    setActiveFilter(filter)
    setIsOpen(false)
    onFilterChange?.(filter)
  }

  const activeFilterLabel = filters.find(f => f.value === activeFilter)?.label || 'Mês'

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Período:</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">{activeFilterLabel}</span>
            <ChevronDown className={clsx(
              'w-4 h-4 text-gray-500 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    className={clsx(
                      'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg',
                      activeFilter === filter.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {activeFilter === 'custom' && (
        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
