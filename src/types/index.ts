export type ReportType = 'DRE' | 'CASH_FLOW' | 'COST_CENTER' | 'PRODUCT_SALES' | 'CUSTOMER'

export interface DateRange {
  from: Date
  to: Date
}

export interface ReportFilters {
  dateRange: DateRange
  centroCustoId?: string
  produtoId?: string
  clienteId?: string
}

// DRE (Income Statement) Types
export interface DREData {
  periodo: DateRange
  receitaOperacional: number
  receitasPorCategoria: CategoryRevenue[]
  custosDiretos: number
  lucroBruto: number
  margemBruta: number
  despesasOperacionais: number
  despesasPorCategoria: CategoryExpense[]
  lucroOperacional: number
  margemOperacional: number
  lucroLiquido: number
  margemLiquida: number
  resumoExecutivo: {
    totalReceitas: number
    totalDespesas: number
    resultado: number
  }
}

export interface CategoryRevenue {
  categoria: string
  valor: number
  percentual: number
}

export interface CategoryExpense {
  categoria: string
  valor: number
  percentual: number
}

// Cash Flow Types
export interface CashFlowData {
  periodo: DateRange
  saldoInicial: number
  entradas: CashFlowEntry[]
  saidas: CashFlowEntry[]
  totalEntradas: number
  totalSaidas: number
  saldoFinal: number
  fluxoMensal: MonthlyFlow[]
  resumoExecutivo: {
    totalEntradas: number
    totalSaidas: number
    saldoLiquido: number
  }
}

export interface CashFlowEntry {
  data: Date
  descricao: string
  categoria: string
  valor: number
  metodoPagamento: string
  status: string
}

export interface MonthlyFlow {
  mes: string
  entradas: number
  saidas: number
  saldo: number
}

// Cost Center Analysis Types
export interface CostCenterAnalysisData {
  periodo: DateRange
  centrosCusto: CostCenterDetail[]
  totalReceitas: number
  totalDespesas: number
  resultado: number
  resumoExecutivo: {
    totalCentros: number
    centroMaisLucrativo: string
    centroPrejuizo: string
  }
}

export interface CostCenterDetail {
  id: string
  nome: string
  cor: string
  receitas: number
  despesas: number
  resultado: number
  percentualReceita: number
  percentualDespesa: number
  transacoesCount: number
}

// Product/Sales Report Types
export interface ProductSalesData {
  periodo: DateRange
  produtos: ProductDetail[]
  totalVendas: number
  totalQuantidade: number
  ticketMedio: number
  resumoExecutivo: {
    produtoMaisVendido: string
    maiorFaturamento: string
    totalProdutos: number
  }
  vendasPorMes: MonthlySales[]
}

export interface ProductDetail {
  id: string
  nome: string
  tipo: string
  quantidadeVendas: number
  valorTotal: number
  ticketMedio: number
  percentualVendas: number
}

export interface MonthlySales {
  mes: string
  quantidade: number
  valor: number
}

// Customer Report Types
export interface CustomerReportData {
  periodo: DateRange
  clientes: CustomerDetail[]
  totalClientes: number
  totalReceitas: number
  ticketMedio: number
  resumoExecutivo: {
    clienteMaiorCompra: string
    clienteMaisFrequente: string
    novosCLientes: number
  }
  receitasPorMes: MonthlyCustomerRevenue[]
}

export interface CustomerDetail {
  id: string
  nome: string
  tipo: string
  email?: string
  telefone?: string
  quantidadeCompras: number
  valorTotal: number
  ticketMedio: number
  ultimaCompra: Date
}

export interface MonthlyCustomerRevenue {
  mes: string
  clientes: number
  valor: number
}

// Export Types
export type ExportFormat = 'PDF' | 'EXCEL'

export interface ExportOptions {
  format: ExportFormat
  includeCharts: boolean
  includeDetails: boolean
}
