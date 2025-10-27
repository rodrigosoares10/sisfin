import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CashFlowData, CashFlowEntry, MonthlyFlow } from '@/types'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const centroCustoId = searchParams.get('centroCustoId')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parâmetros from e to são obrigatórios' },
        { status: 400 }
      )
    }

    const dateFrom = new Date(from)
    const dateTo = new Date(to)

    // Build filter
    const filter: any = {
      data: {
        gte: dateFrom,
        lte: dateTo,
      },
      statusPagamento: 'PAGO',
    }

    if (centroCustoId) {
      filter.centroCustoId = centroCustoId
    }

    // Get all paid transactions
    const transacoes = await prisma.transacao.findMany({
      where: filter,
      include: {
        centroCusto: true,
        produto: true,
        cliente: true,
      },
      orderBy: {
        data: 'asc',
      },
    })

    // Calculate initial balance (before the period)
    const transacoesAnteriores = await prisma.transacao.findMany({
      where: {
        data: {
          lt: dateFrom,
        },
        statusPagamento: 'PAGO',
      },
    })

    const saldoInicial = transacoesAnteriores.reduce((sum, t) => {
      return sum + (t.tipo === 'RECEITA' ? Number(t.valor) : -Number(t.valor))
    }, 0)

    // Separate entries and exits
    const entradas: CashFlowEntry[] = transacoes
      .filter((t) => t.tipo === 'RECEITA')
      .map((t) => ({
        data: t.data,
        descricao: t.descricao,
        categoria: t.categoria || 'Sem categoria',
        valor: Number(t.valor),
        metodoPagamento: t.metodoPagamento || 'Não informado',
        status: t.statusPagamento,
      }))

    const saidas: CashFlowEntry[] = transacoes
      .filter((t) => t.tipo === 'DESPESA')
      .map((t) => ({
        data: t.data,
        descricao: t.descricao,
        categoria: t.categoria || 'Sem categoria',
        valor: Number(t.valor),
        metodoPagamento: t.metodoPagamento || 'Não informado',
        status: t.statusPagamento,
      }))

    const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0)
    const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0)
    const saldoFinal = saldoInicial + totalEntradas - totalSaidas

    // Calculate monthly flow
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo })
    const fluxoMensal: MonthlyFlow[] = months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const entradasMes = transacoes
        .filter(
          (t) =>
            t.tipo === 'RECEITA' &&
            t.data >= monthStart &&
            t.data <= monthEnd
        )
        .reduce((sum, t) => sum + Number(t.valor), 0)

      const saidasMes = transacoes
        .filter(
          (t) =>
            t.tipo === 'DESPESA' &&
            t.data >= monthStart &&
            t.data <= monthEnd
        )
        .reduce((sum, t) => sum + Number(t.valor), 0)

      return {
        mes: format(month, 'MMM/yyyy', { locale: ptBR }),
        entradas: entradasMes,
        saidas: saidasMes,
        saldo: entradasMes - saidasMes,
      }
    })

    const cashFlowData: CashFlowData = {
      periodo: {
        from: dateFrom,
        to: dateTo,
      },
      saldoInicial,
      entradas,
      saidas,
      totalEntradas,
      totalSaidas,
      saldoFinal,
      fluxoMensal,
      resumoExecutivo: {
        totalEntradas,
        totalSaidas,
        saldoLiquido: totalEntradas - totalSaidas,
      },
    }

    return NextResponse.json(cashFlowData)
  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de fluxo de caixa' },
      { status: 500 }
    )
  }
}
