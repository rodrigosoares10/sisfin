import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CostCenterAnalysisData, CostCenterDetail } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parâmetros from e to são obrigatórios' },
        { status: 400 }
      )
    }

    const dateFrom = new Date(from)
    const dateTo = new Date(to)

    // Get all cost centers
    const centrosCusto = await prisma.centroCusto.findMany({
      where: {
        ativo: true,
      },
      include: {
        transacoes: {
          where: {
            data: {
              gte: dateFrom,
              lte: dateTo,
            },
            statusPagamento: 'PAGO',
          },
        },
      },
    })

    let totalReceitas = 0
    let totalDespesas = 0

    const centrosCustoDetails: CostCenterDetail[] = centrosCusto.map((cc) => {
      const receitas = cc.transacoes
        .filter((t) => t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + Number(t.valor), 0)

      const despesas = cc.transacoes
        .filter((t) => t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + Number(t.valor), 0)

      totalReceitas += receitas
      totalDespesas += despesas

      return {
        id: cc.id,
        nome: cc.nome,
        cor: cc.cor || '#gray',
        receitas,
        despesas,
        resultado: receitas - despesas,
        percentualReceita: 0, // Will be calculated after
        percentualDespesa: 0, // Will be calculated after
        transacoesCount: cc.transacoes.length,
      }
    })

    // Calculate percentages
    centrosCustoDetails.forEach((cc) => {
      cc.percentualReceita = totalReceitas > 0 ? (cc.receitas / totalReceitas) * 100 : 0
      cc.percentualDespesa = totalDespesas > 0 ? (cc.despesas / totalDespesas) * 100 : 0
    })

    // Sort by result (most profitable first)
    centrosCustoDetails.sort((a, b) => b.resultado - a.resultado)

    const resultado = totalReceitas - totalDespesas

    const costCenterData: CostCenterAnalysisData = {
      periodo: {
        from: dateFrom,
        to: dateTo,
      },
      centrosCusto: centrosCustoDetails,
      totalReceitas,
      totalDespesas,
      resultado,
      resumoExecutivo: {
        totalCentros: centrosCustoDetails.length,
        centroMaisLucrativo: centrosCustoDetails[0]?.nome || 'N/A',
        centroPrejuizo:
          centrosCustoDetails.find((cc) => cc.resultado < 0)?.nome || 'N/A',
      },
    }

    return NextResponse.json(costCenterData)
  } catch (error) {
    console.error('Erro ao gerar relatório de centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de centro de custo' },
      { status: 500 }
    )
  }
}
