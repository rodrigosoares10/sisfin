import * as XLSX from 'xlsx'
import { formatCurrency, formatDate } from './utils'
import {
  DREData,
  CashFlowData,
  CostCenterAnalysisData,
  ProductSalesData,
  CustomerReportData,
} from '@/types'

// DRE Excel Export
export function exportDREtoExcel(data: DREData) {
  const wb = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ['DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)'],
    [''],
    ['Período:', `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`],
    ['Gerado em:', formatDate(new Date())],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Total de Receitas:', formatCurrency(data.resumoExecutivo.totalReceitas)],
    ['Total de Despesas:', formatCurrency(data.resumoExecutivo.totalDespesas)],
    ['Resultado:', formatCurrency(data.resumoExecutivo.resultado)],
    [''],
    ['INDICADORES FINANCEIROS'],
    ['Receita Operacional:', formatCurrency(data.receitaOperacional)],
    ['Lucro Bruto:', formatCurrency(data.lucroBruto), 'Margem:', `${data.margemBruta.toFixed(2)}%`],
    ['Lucro Operacional:', formatCurrency(data.lucroOperacional), 'Margem:', `${data.margemOperacional.toFixed(2)}%`],
    ['Lucro Líquido:', formatCurrency(data.lucroLiquido), 'Margem:', `${data.margemLiquida.toFixed(2)}%`],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

  // Revenue Sheet
  const revenueData = [
    ['RECEITAS POR CATEGORIA'],
    ['Categoria', 'Valor', 'Percentual'],
    ...data.receitasPorCategoria.map((r) => [
      r.categoria,
      r.valor,
      `${r.percentual.toFixed(2)}%`,
    ]),
  ]
  const wsRevenue = XLSX.utils.aoa_to_sheet(revenueData)
  XLSX.utils.book_append_sheet(wb, wsRevenue, 'Receitas')

  // Expenses Sheet
  const expensesData = [
    ['DESPESAS POR CATEGORIA'],
    ['Categoria', 'Valor', 'Percentual'],
    ...data.despesasPorCategoria.map((d) => [
      d.categoria,
      d.valor,
      `${d.percentual.toFixed(2)}%`,
    ]),
  ]
  const wsExpenses = XLSX.utils.aoa_to_sheet(expensesData)
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Despesas')

  XLSX.writeFile(wb, `DRE_${formatDate(new Date())}.xlsx`)
}

// Cash Flow Excel Export
export function exportCashFlowtoExcel(data: CashFlowData) {
  const wb = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ['RELATÓRIO DE FLUXO DE CAIXA'],
    [''],
    ['Período:', `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`],
    ['Gerado em:', formatDate(new Date())],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Saldo Inicial:', formatCurrency(data.saldoInicial)],
    ['Total de Entradas:', formatCurrency(data.resumoExecutivo.totalEntradas)],
    ['Total de Saídas:', formatCurrency(data.resumoExecutivo.totalSaidas)],
    ['Saldo Final:', formatCurrency(data.saldoFinal)],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

  // Monthly Flow Sheet
  const monthlyData = [
    ['FLUXO MENSAL'],
    ['Mês', 'Entradas', 'Saídas', 'Saldo'],
    ...data.fluxoMensal.map((f) => [f.mes, f.entradas, f.saidas, f.saldo]),
  ]
  const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData)
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Fluxo Mensal')

  // Entries Sheet
  const entriesData = [
    ['ENTRADAS'],
    ['Data', 'Descrição', 'Categoria', 'Valor', 'Método', 'Status'],
    ...data.entradas.map((e) => [
      formatDate(e.data),
      e.descricao,
      e.categoria,
      e.valor,
      e.metodoPagamento,
      e.status,
    ]),
  ]
  const wsEntries = XLSX.utils.aoa_to_sheet(entriesData)
  XLSX.utils.book_append_sheet(wb, wsEntries, 'Entradas')

  // Exits Sheet
  const exitsData = [
    ['SAÍDAS'],
    ['Data', 'Descrição', 'Categoria', 'Valor', 'Método', 'Status'],
    ...data.saidas.map((s) => [
      formatDate(s.data),
      s.descricao,
      s.categoria,
      s.valor,
      s.metodoPagamento,
      s.status,
    ]),
  ]
  const wsExits = XLSX.utils.aoa_to_sheet(exitsData)
  XLSX.utils.book_append_sheet(wb, wsExits, 'Saídas')

  XLSX.writeFile(wb, `Fluxo_Caixa_${formatDate(new Date())}.xlsx`)
}

// Cost Center Excel Export
export function exportCostCentertoExcel(data: CostCenterAnalysisData) {
  const wb = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ['ANÁLISE POR CENTRO DE CUSTO'],
    [''],
    ['Período:', `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`],
    ['Gerado em:', formatDate(new Date())],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Total de Centros de Custo:', data.resumoExecutivo.totalCentros],
    ['Centro Mais Lucrativo:', data.resumoExecutivo.centroMaisLucrativo],
    ['Centro com Prejuízo:', data.resumoExecutivo.centroPrejuizo],
    [''],
    ['Total de Receitas:', formatCurrency(data.totalReceitas)],
    ['Total de Despesas:', formatCurrency(data.totalDespesas)],
    ['Resultado:', formatCurrency(data.resultado)],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

  // Cost Centers Sheet
  const ccData = [
    ['DETALHAMENTO POR CENTRO DE CUSTO'],
    ['Centro de Custo', 'Receitas', 'Despesas', 'Resultado', '% Receita', '% Despesa', 'Transações'],
    ...data.centrosCusto.map((cc) => [
      cc.nome,
      cc.receitas,
      cc.despesas,
      cc.resultado,
      `${cc.percentualReceita.toFixed(2)}%`,
      `${cc.percentualDespesa.toFixed(2)}%`,
      cc.transacoesCount,
    ]),
  ]
  const wsCostCenters = XLSX.utils.aoa_to_sheet(ccData)
  XLSX.utils.book_append_sheet(wb, wsCostCenters, 'Centros de Custo')

  XLSX.writeFile(wb, `Centro_Custo_${formatDate(new Date())}.xlsx`)
}

// Product Sales Excel Export
export function exportProductSalestoExcel(data: ProductSalesData) {
  const wb = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ['RELATÓRIO DE PRODUTOS/VENDAS'],
    [''],
    ['Período:', `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`],
    ['Gerado em:', formatDate(new Date())],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Total de Produtos:', data.resumoExecutivo.totalProdutos],
    ['Produto Mais Vendido:', data.resumoExecutivo.produtoMaisVendido],
    ['Total de Vendas:', formatCurrency(data.totalVendas)],
    ['Total de Quantidade:', data.totalQuantidade],
    ['Ticket Médio:', formatCurrency(data.ticketMedio)],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

  // Products Sheet
  const productsData = [
    ['DETALHAMENTO POR PRODUTO'],
    ['Produto', 'Tipo', 'Quantidade Vendas', 'Valor Total', 'Ticket Médio', '% Vendas'],
    ...data.produtos.map((p) => [
      p.nome,
      p.tipo,
      p.quantidadeVendas,
      p.valorTotal,
      p.ticketMedio,
      `${p.percentualVendas.toFixed(2)}%`,
    ]),
  ]
  const wsProducts = XLSX.utils.aoa_to_sheet(productsData)
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Produtos')

  // Monthly Sales Sheet
  const monthlySalesData = [
    ['VENDAS POR MÊS'],
    ['Mês', 'Quantidade', 'Valor'],
    ...data.vendasPorMes.map((v) => [v.mes, v.quantidade, v.valor]),
  ]
  const wsMonthlySales = XLSX.utils.aoa_to_sheet(monthlySalesData)
  XLSX.utils.book_append_sheet(wb, wsMonthlySales, 'Vendas Mensais')

  XLSX.writeFile(wb, `Produtos_Vendas_${formatDate(new Date())}.xlsx`)
}

// Customer Excel Export
export function exportCustomertoExcel(data: CustomerReportData) {
  const wb = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ['RELATÓRIO DE CLIENTES'],
    [''],
    ['Período:', `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`],
    ['Gerado em:', formatDate(new Date())],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Total de Clientes:', data.totalClientes],
    ['Cliente Maior Compra:', data.resumoExecutivo.clienteMaiorCompra],
    ['Cliente Mais Frequente:', data.resumoExecutivo.clienteMaisFrequente],
    ['Novos Clientes:', data.resumoExecutivo.novosCLientes],
    ['Total de Receitas:', formatCurrency(data.totalReceitas)],
    ['Ticket Médio:', formatCurrency(data.ticketMedio)],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

  // Customers Sheet
  const customersData = [
    ['DETALHAMENTO POR CLIENTE'],
    ['Cliente', 'Tipo', 'Email', 'Telefone', 'Compras', 'Valor Total', 'Ticket Médio', 'Última Compra'],
    ...data.clientes.map((c) => [
      c.nome,
      c.tipo,
      c.email || '',
      c.telefone || '',
      c.quantidadeCompras,
      c.valorTotal,
      c.ticketMedio,
      formatDate(c.ultimaCompra),
    ]),
  ]
  const wsCustomers = XLSX.utils.aoa_to_sheet(customersData)
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'Clientes')

  // Monthly Revenue Sheet
  const monthlyRevenueData = [
    ['RECEITAS POR MÊS'],
    ['Mês', 'Clientes', 'Valor'],
    ...data.receitasPorMes.map((r) => [r.mes, r.clientes, r.valor]),
  ]
  const wsMonthlyRevenue = XLSX.utils.aoa_to_sheet(monthlyRevenueData)
  XLSX.utils.book_append_sheet(wb, wsMonthlyRevenue, 'Receitas Mensais')

  XLSX.writeFile(wb, `Clientes_${formatDate(new Date())}.xlsx`)
}
