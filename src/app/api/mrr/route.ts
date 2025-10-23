import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get current date
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Get active MRR products
    const mrrProducts = await prisma.produto.findMany({
      where: {
        tipo: 'MRR',
        ativo: true
      },
      include: {
        transacoes: {
          where: {
            tipo: 'RECEITA',
            statusPagamento: 'PAGO',
            recorrente: true
          },
          select: {
            valor: true,
            data: true
          }
        }
      }
    })

    // Calculate current month MRR (sum of all active MRR product values)
    const currentMRR = mrrProducts.reduce(
      (sum, produto) => sum + Number(produto.valor),
      0
    )

    // Get previous month's date
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const previousMonth = previousMonthDate.getMonth()
    const previousYear = previousMonthDate.getFullYear()

    // Calculate previous month MRR
    const previousMRRProducts = await prisma.produto.findMany({
      where: {
        tipo: 'MRR',
        ativo: true,
        createdAt: {
          lte: new Date(previousYear, previousMonth + 1, 0) // Last day of previous month
        }
      }
    })

    const previousMRR = previousMRRProducts.reduce(
      (sum, produto) => sum + Number(produto.valor),
      0
    )

    // Calculate growth
    const growth = currentMRR - previousMRR
    const growthPercentage = previousMRR > 0 ? (growth / previousMRR) * 100 : 100

    // Calculate ARR (Annual Recurring Revenue)
    const arr = currentMRR * 12

    // Count active subscriptions (products with transactions)
    const activeSubscriptions = mrrProducts.filter(
      p => p.transacoes.length > 0
    ).length

    // Calculate monthly evolution (last 6 months)
    const monthlyEvolution = []
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1)
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()

      const monthProducts = await prisma.produto.findMany({
        where: {
          tipo: 'MRR',
          ativo: true,
          createdAt: {
            lte: new Date(targetYear, targetMonth + 1, 0)
          }
        }
      })

      const monthMRR = monthProducts.reduce(
        (sum, p) => sum + Number(p.valor),
        0
      )

      // Calculate previous month for comparison
      let prevMonthMRR = 0
      if (i < 5) {
        const prevDate = new Date(currentYear, currentMonth - i - 1, 1)
        const prevProducts = await prisma.produto.findMany({
          where: {
            tipo: 'MRR',
            ativo: true,
            createdAt: {
              lte: new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0)
            }
          }
        })
        prevMonthMRR = prevProducts.reduce((sum, p) => sum + Number(p.valor), 0)
      }

      const change = monthMRR - prevMonthMRR
      const changePercentage = prevMonthMRR > 0 ? (change / prevMonthMRR) * 100 : 0

      monthlyEvolution.push({
        month: targetDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        mrr: monthMRR,
        change,
        changePercentage
      })
    }

    const metrics = {
      currentMRR,
      previousMRR,
      growth,
      growthPercentage,
      arr,
      activeSubscriptions,
      monthlyEvolution
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Erro ao calcular MRR:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular MRR' },
      { status: 500 }
    )
  }
}
