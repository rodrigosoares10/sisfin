export interface CentroCusto {
  id: string
  nome: string
  descricao: string | null
  cor: string
  ativo: boolean
  ordem: number
  criadoEm: Date
  atualizadoEm: Date
}

export interface CentroCustoComStats extends CentroCusto {
  totalGasto: number
  porcentagemTotal: number
  metaMensal?: number
  progressoMeta?: number
}

export interface Meta {
  id: string
  tipo: 'RECEITA' | 'DESPESA' | 'LUCRO'
  valor: number
  mes: number
  ano: number
  centroCustoId: string | null
  descricao: string | null
  atingida: boolean
}

export interface CreateCentroCustoInput {
  nome: string
  descricao?: string
  cor: string
  ativo?: boolean
}

export interface UpdateCentroCustoInput {
  nome?: string
  descricao?: string
  cor?: string
  ativo?: boolean
  ordem?: number
}
