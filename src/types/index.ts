export interface Transaction {
  id: string
  date: Date
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string
}

export interface KPIData {
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ReactNode
  color: 'green' | 'red' | 'blue' | 'purple'
}

export interface ChartData {
  name: string
  value: number
  income?: number
  expense?: number
  cashFlow?: number
}

export type DateFilter = 'day' | 'week' | 'month' | 'year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}
