import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate } from './utils'
import {
  DREData,
  CashFlowData,
  CostCenterAnalysisData,
  ProductSalesData,
  CustomerReportData,
} from '@/types'

// Helper function to add header to PDF
function addHeader(doc: jsPDF, title: string, period: string) {
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SisFin - Sistema Financeiro', 14, 20)

  doc.setFontSize(16)
  doc.text(title, 14, 30)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Período: ${period}`, 14, 38)
  doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 44)

  doc.setLineWidth(0.5)
  doc.line(14, 48, 196, 48)

  return 55
}

// Helper function to add footer
function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }
}

// DRE PDF Export
export function exportDREtoPDF(data: DREData) {
  const doc = new jsPDF()

  const period = `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`
  let yPos = addHeader(doc, 'Demonstração do Resultado do Exercício (DRE)', period)

  // Executive Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Executivo', 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de Receitas: ${formatCurrency(data.resumoExecutivo.totalReceitas)}`, 14, yPos)
  yPos += 6
  doc.text(`Total de Despesas: ${formatCurrency(data.resumoExecutivo.totalDespesas)}`, 14, yPos)
  yPos += 6
  doc.setFont('helvetica', 'bold')
  const resultadoColor = data.resumoExecutivo.resultado >= 0 ? [0, 128, 0] : [255, 0, 0]
  doc.setTextColor(resultadoColor[0], resultadoColor[1], resultadoColor[2])
  doc.text(`Resultado: ${formatCurrency(data.resumoExecutivo.resultado)}`, 14, yPos)
  doc.setTextColor(0, 0, 0)
  yPos += 10

  // Revenue by Category
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Receitas por Categoria', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Categoria', 'Valor', 'Percentual']],
    body: data.receitasPorCategoria.map((r) => [
      r.categoria,
      formatCurrency(r.valor),
      `${r.percentual.toFixed(2)}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Expenses by Category
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Despesas por Categoria', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Categoria', 'Valor', 'Percentual']],
    body: data.despesasPorCategoria.map((d) => [
      d.categoria,
      formatCurrency(d.valor),
      `${d.percentual.toFixed(2)}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [220, 53, 69] },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Financial Indicators
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Indicadores Financeiros', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Indicador', 'Valor', 'Margem']],
    body: [
      ['Receita Operacional', formatCurrency(data.receitaOperacional), '-'],
      ['Lucro Bruto', formatCurrency(data.lucroBruto), `${data.margemBruta.toFixed(2)}%`],
      ['Lucro Operacional', formatCurrency(data.lucroOperacional), `${data.margemOperacional.toFixed(2)}%`],
      ['Lucro Líquido', formatCurrency(data.lucroLiquido), `${data.margemLiquida.toFixed(2)}%`],
    ],
    theme: 'grid',
  })

  addFooter(doc)
  doc.save(`DRE_${formatDate(new Date())}.pdf`)
}

// Cash Flow PDF Export
export function exportCashFlowtoPDF(data: CashFlowData) {
  const doc = new jsPDF()

  const period = `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`
  let yPos = addHeader(doc, 'Relatório de Fluxo de Caixa', period)

  // Executive Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Executivo', 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Saldo Inicial: ${formatCurrency(data.saldoInicial)}`, 14, yPos)
  yPos += 6
  doc.text(`Total de Entradas: ${formatCurrency(data.resumoExecutivo.totalEntradas)}`, 14, yPos)
  yPos += 6
  doc.text(`Total de Saídas: ${formatCurrency(data.resumoExecutivo.totalSaidas)}`, 14, yPos)
  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text(`Saldo Final: ${formatCurrency(data.saldoFinal)}`, 14, yPos)
  yPos += 10

  // Monthly Flow
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Fluxo Mensal', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Mês', 'Entradas', 'Saídas', 'Saldo']],
    body: data.fluxoMensal.map((f) => [
      f.mes,
      formatCurrency(f.entradas),
      formatCurrency(f.saidas),
      formatCurrency(f.saldo),
    ]),
    theme: 'striped',
  })

  addFooter(doc)
  doc.save(`Fluxo_Caixa_${formatDate(new Date())}.pdf`)
}

// Cost Center PDF Export
export function exportCostCentertoPDF(data: CostCenterAnalysisData) {
  const doc = new jsPDF()

  const period = `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`
  let yPos = addHeader(doc, 'Análise por Centro de Custo', period)

  // Executive Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Executivo', 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de Centros de Custo: ${data.resumoExecutivo.totalCentros}`, 14, yPos)
  yPos += 6
  doc.text(`Centro Mais Lucrativo: ${data.resumoExecutivo.centroMaisLucrativo}`, 14, yPos)
  yPos += 6
  doc.text(`Centro com Prejuízo: ${data.resumoExecutivo.centroPrejuizo}`, 14, yPos)
  yPos += 10

  // Cost Centers Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento por Centro de Custo', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Centro de Custo', 'Receitas', 'Despesas', 'Resultado', 'Transações']],
    body: data.centrosCusto.map((cc) => [
      cc.nome,
      formatCurrency(cc.receitas),
      formatCurrency(cc.despesas),
      formatCurrency(cc.resultado),
      cc.transacoesCount.toString(),
    ]),
    theme: 'striped',
  })

  addFooter(doc)
  doc.save(`Centro_Custo_${formatDate(new Date())}.pdf`)
}

// Product Sales PDF Export
export function exportProductSalestoPDF(data: ProductSalesData) {
  const doc = new jsPDF()

  const period = `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`
  let yPos = addHeader(doc, 'Relatório de Produtos/Vendas', period)

  // Executive Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Executivo', 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de Produtos: ${data.resumoExecutivo.totalProdutos}`, 14, yPos)
  yPos += 6
  doc.text(`Produto Mais Vendido: ${data.resumoExecutivo.produtoMaisVendido}`, 14, yPos)
  yPos += 6
  doc.text(`Total de Vendas: ${formatCurrency(data.totalVendas)}`, 14, yPos)
  yPos += 6
  doc.text(`Ticket Médio: ${formatCurrency(data.ticketMedio)}`, 14, yPos)
  yPos += 10

  // Products Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento por Produto', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Produto', 'Tipo', 'Quantidade', 'Valor Total', 'Ticket Médio']],
    body: data.produtos.map((p) => [
      p.nome,
      p.tipo,
      p.quantidadeVendas.toString(),
      formatCurrency(p.valorTotal),
      formatCurrency(p.ticketMedio),
    ]),
    theme: 'striped',
  })

  addFooter(doc)
  doc.save(`Produtos_Vendas_${formatDate(new Date())}.pdf`)
}

// Customer PDF Export
export function exportCustomertoPDF(data: CustomerReportData) {
  const doc = new jsPDF()

  const period = `${formatDate(data.periodo.from)} - ${formatDate(data.periodo.to)}`
  let yPos = addHeader(doc, 'Relatório de Clientes', period)

  // Executive Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Executivo', 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de Clientes: ${data.totalClientes}`, 14, yPos)
  yPos += 6
  doc.text(`Cliente Maior Compra: ${data.resumoExecutivo.clienteMaiorCompra}`, 14, yPos)
  yPos += 6
  doc.text(`Total de Receitas: ${formatCurrency(data.totalReceitas)}`, 14, yPos)
  yPos += 6
  doc.text(`Ticket Médio: ${formatCurrency(data.ticketMedio)}`, 14, yPos)
  yPos += 10

  // Customers Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento por Cliente', 14, yPos)
  yPos += 5

  autoTable(doc, {
    startY: yPos,
    head: [['Cliente', 'Tipo', 'Compras', 'Valor Total', 'Ticket Médio']],
    body: data.clientes.map((c) => [
      c.nome,
      c.tipo,
      c.quantidadeCompras.toString(),
      formatCurrency(c.valorTotal),
      formatCurrency(c.ticketMedio),
    ]),
    theme: 'striped',
  })

  addFooter(doc)
  doc.save(`Clientes_${formatDate(new Date())}.pdf`)
}
