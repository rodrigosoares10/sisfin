'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { subMonths, startOfMonth, endOfMonth } from 'date-fns'
import {
  FileText,
  TrendingUp,
  Building2,
  Package,
  Users,
  Download,
  Loader2,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportHeader } from '@/components/reports/report-header'
import { ReportSummary } from '@/components/reports/report-summary'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

import { formatCurrency, formatDate } from '@/lib/utils'
import { ReportType, DREData, CashFlowData, CostCenterAnalysisData, ProductSalesData, CustomerReportData } from '@/types'
import {
  exportDREtoPDF,
  exportCashFlowtoPDF,
  exportCostCentertoPDF,
  exportProductSalestoPDF,
  exportCustomertoPDF,
} from '@/lib/export-pdf'
import {
  exportDREtoExcel,
  exportCashFlowtoExcel,
  exportCostCentertoExcel,
  exportProductSalestoExcel,
  exportCustomertoExcel,
} from '@/lib/export-excel'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

function ReportsPageContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as ReportType | null

  const [reportType, setReportType] = useState<ReportType>(typeParam || 'DRE')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date()),
  })
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    if (typeParam) {
      setReportType(typeParam)
    }
  }, [typeParam])

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchReportData()
    }
  }, [reportType, dateRange])

  const fetchReportData = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const endpoint = getEndpoint(reportType)
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      const response = await fetch(`${endpoint}?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar relatório')

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEndpoint = (type: ReportType): string => {
    const endpoints: Record<ReportType, string> = {
      DRE: '/api/relatorios/dre',
      CASH_FLOW: '/api/relatorios/fluxo-caixa',
      COST_CENTER: '/api/relatorios/centro-custo',
      PRODUCT_SALES: '/api/relatorios/produtos',
      CUSTOMER: '/api/relatorios/clientes',
    }
    return endpoints[type]
  }

  const handleExportPDF = () => {
    if (!reportData) return

    switch (reportType) {
      case 'DRE':
        exportDREtoPDF(reportData as DREData)
        break
      case 'CASH_FLOW':
        exportCashFlowtoPDF(reportData as CashFlowData)
        break
      case 'COST_CENTER':
        exportCostCentertoPDF(reportData as CostCenterAnalysisData)
        break
      case 'PRODUCT_SALES':
        exportProductSalestoPDF(reportData as ProductSalesData)
        break
      case 'CUSTOMER':
        exportCustomertoPDF(reportData as CustomerReportData)
        break
    }
  }

  const handleExportExcel = () => {
    if (!reportData) return

    switch (reportType) {
      case 'DRE':
        exportDREtoExcel(reportData as DREData)
        break
      case 'CASH_FLOW':
        exportCashFlowtoExcel(reportData as CashFlowData)
        break
      case 'COST_CENTER':
        exportCostCentertoExcel(reportData as CostCenterAnalysisData)
        break
      case 'PRODUCT_SALES':
        exportProductSalestoExcel(reportData as ProductSalesData)
        break
      case 'CUSTOMER':
        exportCustomertoExcel(reportData as CustomerReportData)
        break
    }
  }

  const reportTitles: Record<ReportType, string> = {
    DRE: 'Demonstração do Resultado do Exercício (DRE)',
    CASH_FLOW: 'Relatório de Fluxo de Caixa',
    COST_CENTER: 'Análise por Centro de Custo',
    PRODUCT_SALES: 'Relatório de Produtos/Vendas',
    CUSTOMER: 'Relatório de Clientes',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          <Button onClick={fetchReportData} disabled={loading || !dateRange?.from || !dateRange?.to}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Gerar Relatório'
            )}
          </Button>
          {reportData && (
            <>
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="DRE">DRE</TabsTrigger>
          <TabsTrigger value="CASH_FLOW">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="COST_CENTER">Centro de Custo</TabsTrigger>
          <TabsTrigger value="PRODUCT_SALES">Produtos</TabsTrigger>
          <TabsTrigger value="CUSTOMER">Clientes</TabsTrigger>
        </TabsList>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && reportData && dateRange && (
          <>
            <TabsContent value="DRE">
              <DREReport data={reportData as DREData} />
            </TabsContent>
            <TabsContent value="CASH_FLOW">
              <CashFlowReport data={reportData as CashFlowData} />
            </TabsContent>
            <TabsContent value="COST_CENTER">
              <CostCenterReport data={reportData as CostCenterAnalysisData} />
            </TabsContent>
            <TabsContent value="PRODUCT_SALES">
              <ProductSalesReport data={reportData as ProductSalesData} />
            </TabsContent>
            <TabsContent value="CUSTOMER">
              <CustomerReport data={reportData as CustomerReportData} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

function DREReport({ data }: { data: DREData }) {
  return (
    <div className="space-y-6">
      <ReportHeader title="Demonstração do Resultado do Exercício (DRE)" period={data.periodo} />

      <ReportSummary
        title="Resumo Executivo"
        items={[
          { label: 'Total de Receitas', value: data.resumoExecutivo.totalReceitas, variant: 'success' },
          { label: 'Total de Despesas', value: data.resumoExecutivo.totalDespesas, variant: 'danger' },
          {
            label: 'Resultado',
            value: data.resumoExecutivo.resultado,
            variant: data.resumoExecutivo.resultado >= 0 ? 'success' : 'danger',
          },
          { label: 'Margem Líquida', value: `${data.margemLiquida.toFixed(2)}%` },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.receitasPorCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.categoria}: ${entry.percentual.toFixed(1)}%`}
                >
                  {data.receitasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.despesasPorCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.categoria}: ${entry.percentual.toFixed(1)}%`}
                >
                  {data.despesasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Receita Operacional</TableCell>
                <TableCell className="text-right">{formatCurrency(data.receitaOperacional)}</TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lucro Bruto</TableCell>
                <TableCell className="text-right">{formatCurrency(data.lucroBruto)}</TableCell>
                <TableCell className="text-right">{data.margemBruta.toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lucro Operacional</TableCell>
                <TableCell className="text-right">{formatCurrency(data.lucroOperacional)}</TableCell>
                <TableCell className="text-right">{data.margemOperacional.toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lucro Líquido</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(data.lucroLiquido)}</TableCell>
                <TableCell className="text-right font-bold">{data.margemLiquida.toFixed(2)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CashFlowReport({ data }: { data: CashFlowData }) {
  return (
    <div className="space-y-6">
      <ReportHeader title="Relatório de Fluxo de Caixa" period={data.periodo} />

      <ReportSummary
        title="Resumo Executivo"
        items={[
          { label: 'Saldo Inicial', value: data.saldoInicial },
          { label: 'Total de Entradas', value: data.resumoExecutivo.totalEntradas, variant: 'success' },
          { label: 'Total de Saídas', value: data.resumoExecutivo.totalSaidas, variant: 'danger' },
          {
            label: 'Saldo Final',
            value: data.saldoFinal,
            variant: data.saldoFinal >= 0 ? 'success' : 'danger',
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Fluxo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.fluxoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="entradas" fill="#00C49F" name="Entradas" />
              <Bar dataKey="saidas" fill="#FF8042" name="Saídas" />
              <Bar dataKey="saldo" fill="#0088FE" name="Saldo" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entradas.slice(0, 5).map((entrada, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{formatDate(entrada.data)}</TableCell>
                    <TableCell>{entrada.descricao}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(entrada.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.saidas.slice(0, 5).map((saida, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{formatDate(saida.data)}</TableCell>
                    <TableCell>{saida.descricao}</TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(saida.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CostCenterReport({ data }: { data: CostCenterAnalysisData }) {
  return (
    <div className="space-y-6">
      <ReportHeader title="Análise por Centro de Custo" period={data.periodo} />

      <ReportSummary
        title="Resumo Executivo"
        items={[
          { label: 'Total de Centros', value: data.resumoExecutivo.totalCentros },
          { label: 'Total de Receitas', value: data.totalReceitas, variant: 'success' },
          { label: 'Total de Despesas', value: data.totalDespesas, variant: 'danger' },
          {
            label: 'Resultado',
            value: data.resultado,
            variant: data.resultado >= 0 ? 'success' : 'danger',
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Resultado por Centro de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.centrosCusto}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="receitas" fill="#00C49F" name="Receitas" />
              <Bar dataKey="despesas" fill="#FF8042" name="Despesas" />
              <Bar dataKey="resultado" fill="#0088FE" name="Resultado" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Centro de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Centro de Custo</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">Transações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.centrosCusto.map((cc) => (
                <TableRow key={cc.id}>
                  <TableCell className="font-medium">{cc.nome}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(cc.receitas)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(cc.despesas)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      cc.resultado >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(cc.resultado)}
                  </TableCell>
                  <TableCell className="text-right">{cc.transacoesCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductSalesReport({ data }: { data: ProductSalesData }) {
  return (
    <div className="space-y-6">
      <ReportHeader title="Relatório de Produtos/Vendas" period={data.periodo} />

      <ReportSummary
        title="Resumo Executivo"
        items={[
          { label: 'Total de Produtos', value: data.resumoExecutivo.totalProdutos },
          { label: 'Total de Vendas', value: data.totalVendas, variant: 'success' },
          { label: 'Quantidade Total', value: data.totalQuantidade },
          { label: 'Ticket Médio', value: data.ticketMedio },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Vendas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#00C49F" name="Valor" />
              <Line type="monotone" dataKey="quantidade" stroke="#0088FE" name="Quantidade" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">% Vendas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.produtos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>
                    <Badge variant={produto.tipo === 'MRR' ? 'default' : 'secondary'}>
                      {produto.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{produto.quantidadeVendas}</TableCell>
                  <TableCell className="text-right">{formatCurrency(produto.valorTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(produto.ticketMedio)}</TableCell>
                  <TableCell className="text-right">{produto.percentualVendas.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomerReport({ data }: { data: CustomerReportData }) {
  return (
    <div className="space-y-6">
      <ReportHeader title="Relatório de Clientes" period={data.periodo} />

      <ReportSummary
        title="Resumo Executivo"
        items={[
          { label: 'Total de Clientes', value: data.totalClientes },
          { label: 'Total de Receitas', value: data.totalReceitas, variant: 'success' },
          { label: 'Ticket Médio', value: data.ticketMedio },
          { label: 'Novos Clientes', value: data.resumoExecutivo.novosCLientes },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Receitas Mensais por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.receitasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="valor" fill="#00C49F" name="Receita" />
              <Bar dataKey="clientes" fill="#0088FE" name="Clientes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Compras</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead>Última Compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <Badge variant={cliente.tipo === 'PESSOA_JURIDICA' ? 'default' : 'secondary'}>
                      {cliente.tipo === 'PESSOA_JURIDICA' ? 'PJ' : 'PF'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{cliente.quantidadeCompras}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cliente.valorTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cliente.ticketMedio)}</TableCell>
                  <TableCell>{formatDate(cliente.ultimaCompra)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ReportsPageContent />
    </Suspense>
  )
}
