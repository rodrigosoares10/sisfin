'use client'

import { ReactNode } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import clsx from 'clsx'
import { Card } from './Card'

interface KPICardProps {
  title: string
  value: string
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: ReactNode
  color: 'green' | 'red' | 'blue' | 'purple'
}

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
    border: 'border-purple-200'
  }
}

export function KPICard({ title, value, change, changeType, icon, color }: KPICardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={clsx('border-l-4', colors.border)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-600" />
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-lg', colors.bg)}>
          <div className={clsx('text-white', colors.icon, 'p-2 rounded-md')}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  )
}
