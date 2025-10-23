'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Repeat } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { FilterBar } from '@/components/FilterBar'
import { KPICard } from '@/components/KPICard'
import { LineChart, PieChart, BarChart, AreaChart } from '@/components/Charts'
import {
  mockMonthlyData,
  mockExpensesByCategory,
  mockRevenueByProduct,
  mockCashFlow,
  calculateKPIs
} from '@/lib/mockData'
import { DateFilter } from '@/types'

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const kpis = calculateKPIs()

  const handleFilterChange = (filter: DateFilter) => {
    setDateFilter(filter)
    // Aqui você implementaria a lógica para filtrar os dados baseado no filtro selecionado
    console.log('Filter changed to:', filter)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
            </div>

            {/* Filter Bar */}
            <FilterBar onFilterChange={handleFilterChange} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Total de Receitas"
                value={`R$ ${kpis.totalIncome.toLocaleString('pt-BR')}`}
                change={kpis.incomeChange}
                changeType={kpis.incomeChange >= 0 ? 'increase' : 'decrease'}
                icon={<TrendingUp className="w-6 h-6" />}
                color="green"
              />

              <KPICard
                title="Total de Despesas"
                value={`R$ ${kpis.totalExpense.toLocaleString('pt-BR')}`}
                change={Math.abs(kpis.expenseChange)}
                changeType={kpis.expenseChange >= 0 ? 'increase' : 'decrease'}
                icon={<TrendingDown className="w-6 h-6" />}
                color="red"
              />

              <KPICard
                title="Lucro Líquido"
                value={`R$ ${kpis.netProfit.toLocaleString('pt-BR')}`}
                change={kpis.profitChange}
                changeType={kpis.profitChange >= 0 ? 'increase' : 'decrease'}
                icon={<DollarSign className="w-6 h-6" />}
                color="blue"
              />

              <KPICard
                title="MRR"
                value={`R$ ${Math.round(kpis.mrr).toLocaleString('pt-BR')}`}
                change={kpis.mrrChange}
                changeType={kpis.mrrChange >= 0 ? 'increase' : 'decrease'}
                icon={<Repeat className="w-6 h-6" />}
                color="purple"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart - Revenue vs Expenses */}
              <LineChart
                title="Evolução Mensal: Receitas vs Despesas"
                data={mockMonthlyData}
              />

              {/* Pie Chart - Expenses by Cost Center */}
              <PieChart
                title="Despesas por Centro de Custo"
                data={mockExpensesByCategory}
              />

              {/* Bar Chart - Revenue by Product */}
              <BarChart
                title="Receitas por Produto"
                data={mockRevenueByProduct}
              />

              {/* Area Chart - Accumulated Cash Flow */}
              <AreaChart
                title="Fluxo de Caixa Acumulado"
                data={mockCashFlow}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
