'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MRRMetrics } from '@/types'

export function MRRDashboard() {
  const [metrics, setMetrics] = useState<MRRMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMRRMetrics()
  }, [])

  const fetchMRRMetrics = async () => {
    try {
      const response = await fetch('/api/mrr')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Erro ao buscar métricas MRR:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>MRR - Monthly Recurring Revenue</CardTitle>
          <CardDescription>Carregando métricas...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>MRR - Monthly Recurring Revenue</CardTitle>
          <CardDescription>Erro ao carregar métricas</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isPositiveGrowth = metrics.growth >= 0

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            MRR Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(metrics.currentMRR)}</div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className={isPositiveGrowth ? 'text-green-600' : 'text-red-600'}>
              {isPositiveGrowth ? '↑' : '↓'} {formatCurrency(Math.abs(metrics.growth))} (
              {metrics.growthPercentage.toFixed(1)}%)
            </span>
            <span className="text-muted-foreground">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            ARR (Previsão Anual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.arr)}</div>
          <p className="text-xs text-muted-foreground mt-2">MRR × 12 meses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Assinaturas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground mt-2">Produtos com vendas</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>Evolução Mensal do MRR</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.monthlyEvolution.map((month, index) => {
              const isPositive = month.change >= 0
              return (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="min-w-[80px] font-medium">{month.month}</div>
                    <div className="text-lg font-semibold">{formatCurrency(month.mrr)}</div>
                  </div>
                  {index > 0 && (
                    <div className={`flex items-center gap-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{isPositive ? '↑' : '↓'}</span>
                      <span>{formatCurrency(Math.abs(month.change))}</span>
                      <span>({month.changePercentage.toFixed(1)}%)</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
