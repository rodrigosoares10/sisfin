import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DREData } from '@/types'

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

    // Get all transactions
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

    // Calculate revenues
    const receitas = transacoes.filter((t) => t.tipo === 'RECEITA')
    const receitaOperacional = receitas.reduce((sum, t) => sum + Number(t.valor), 0)

    // Group revenues by category
    const receitasPorCategoria: Record<string, number> = {}
    receitas.forEach((t) => {
      const categoria = t.categoria || 'Sem categoria'
      receitasPorCategoria[categoria] = (receitasPorCategoria[categoria] || 0) + Number(t.valor)
    })

    const receitasPorCategoriaArray = Object.entries(receitasPorCategoria).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: receitaOperacional > 0 ? (valor / receitaOperacional) * 100 : 0,
    }))

    // Calculate expenses
    const despesas = transacoes.filter((t) => t.tipo === 'DESPESA')
    const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor), 0)

    // Group expenses by category
    const despesasPorCategoria: Record<string, number> = {}
    despesas.forEach((t) => {
      const categoria = t.categoria || 'Sem categoria'
      despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + Number(t.valor)
    })

    const despesasPorCategoriaArray = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0,
    }))

    // Calculate metrics
    const custosDiretos = 0 // Can be refined based on specific categories
    const lucroBruto = receitaOperacional - custosDiretos
    const margemBruta = receitaOperacional > 0 ? (lucroBruto / receitaOperacional) * 100 : 0

    const despesasOperacionais = totalDespesas
    const lucroOperacional = receitaOperacional - despesasOperacionais
    const margemOperacional = receitaOperacional > 0 ? (lucroOperacional / receitaOperacional) * 100 : 0

    const lucroLiquido = lucroOperacional
    const margemLiquida = receitaOperacional > 0 ? (lucroLiquido / receitaOperacional) * 100 : 0

    const dreData: DREData = {
      periodo: {
        from: dateFrom,
        to: dateTo,
      },
      receitaOperacional,
      receitasPorCategoria: receitasPorCategoriaArray,
      custosDiretos,
      lucroBruto,
      margemBruta,
      despesasOperacionais,
      despesasPorCategoria: despesasPorCategoriaArray,
      lucroOperacional,
      margemOperacional,
      lucroLiquido,
      margemLiquida,
      resumoExecutivo: {
        totalReceitas: receitaOperacional,
        totalDespesas: totalDespesas,
        resultado: lucroLiquido,
      },
    }

    return NextResponse.json(dreData)
  } catch (error) {
    console.error('Erro ao gerar relatório DRE:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório DRE' },
      { status: 500 }
    )
  }
}
