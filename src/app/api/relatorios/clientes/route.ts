import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CustomerReportData, CustomerDetail, MonthlyCustomerRevenue } from '@/types'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const clienteId = searchParams.get('clienteId')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parâmetros from e to são obrigatórios' },
        { status: 400 }
      )
    }

    const dateFrom = new Date(from)
    const dateTo = new Date(to)

    // Build filter
    const filterCliente: any = {
      ativo: true,
    }

    if (clienteId) {
      filterCliente.id = clienteId
    }

    // Get all customers
    const clientes = await prisma.cliente.findMany({
      where: filterCliente,
      include: {
        transacoes: {
          where: {
            data: {
              gte: dateFrom,
              lte: dateTo,
            },
            statusPagamento: 'PAGO',
            tipo: 'RECEITA',
          },
          orderBy: {
            data: 'desc',
          },
        },
      },
    })

    // Count new customers in the period
    const novosClientes = await prisma.cliente.count({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    })

    let totalReceitas = 0
    const clientesComCompras = clientes.filter((c) => c.transacoes.length > 0)

    const clientesDetails: CustomerDetail[] = clientesComCompras.map((c) => {
      const quantidadeCompras = c.transacoes.length
      const valorTotal = c.transacoes.reduce((sum, t) => sum + Number(t.valor), 0)
      const ticketMedio = quantidadeCompras > 0 ? valorTotal / quantidadeCompras : 0
      const ultimaCompra = c.transacoes[0]?.data || new Date()

      totalReceitas += valorTotal

      return {
        id: c.id,
        nome: c.nome,
        tipo: c.tipo,
        email: c.email || undefined,
        telefone: c.telefone || undefined,
        quantidadeCompras,
        valorTotal,
        ticketMedio,
        ultimaCompra,
      }
    })

    // Sort by total value (highest first)
    clientesDetails.sort((a, b) => b.valorTotal - a.valorTotal)

    const ticketMedio =
      clientesDetails.length > 0
        ? totalReceitas / clientesDetails.reduce((sum, c) => sum + c.quantidadeCompras, 0)
        : 0

    // Calculate monthly customer revenue
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo })
    const receitasPorMes: MonthlyCustomerRevenue[] = months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const clientesUnicosMes = new Set<string>()
      let valorMes = 0

      clientes.forEach((c) => {
        const comprasMes = c.transacoes.filter(
          (t) => t.data >= monthStart && t.data <= monthEnd
        )
        if (comprasMes.length > 0) {
          clientesUnicosMes.add(c.id)
          valorMes += comprasMes.reduce((sum, t) => sum + Number(t.valor), 0)
        }
      })

      return {
        mes: format(month, 'MMM/yyyy', { locale: ptBR }),
        clientes: clientesUnicosMes.size,
        valor: valorMes,
      }
    })

    const customerData: CustomerReportData = {
      periodo: {
        from: dateFrom,
        to: dateTo,
      },
      clientes: clientesDetails,
      totalClientes: clientesDetails.length,
      totalReceitas,
      ticketMedio,
      resumoExecutivo: {
        clienteMaiorCompra: clientesDetails[0]?.nome || 'N/A',
        clienteMaisFrequente:
          clientesDetails.sort((a, b) => b.quantidadeCompras - a.quantidadeCompras)[0]?.nome ||
          'N/A',
        novosCLientes: novosClientes,
      },
      receitasPorMes,
    }

    return NextResponse.json(customerData)
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de clientes' },
      { status: 500 }
    )
  }
}
