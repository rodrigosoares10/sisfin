import { Prisma } from '@prisma/client'

export type Product = {
  id: string
  nome: string
  tipo: 'UNICO' | 'MRR'
  valor: number
  descricao?: string | null
  ativo: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    transacoes: number
  }
  receitaTotal?: number
}

export type ProductStats = {
  id: string
  nome: string
  tipo: 'UNICO' | 'MRR'
  valor: number
  ativo: boolean
  salesCount: number
  totalRevenue: number
}

export type MRRMetrics = {
  currentMRR: number
  previousMRR: number
  growth: number
  growthPercentage: number
  arr: number
  activeSubscriptions: number
  monthlyEvolution: {
    month: string
    mrr: number
    change: number
    changePercentage: number
  }[]
}

export type ProductFormData = {
  nome: string
  tipo: 'UNICO' | 'MRR'
  valor: number
  descricao?: string
  ativo: boolean
}
