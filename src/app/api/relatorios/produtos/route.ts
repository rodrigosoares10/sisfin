import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductSalesData, ProductDetail, MonthlySales } from '@/types'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const produtoId = searchParams.get('produtoId')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parâmetros from e to são obrigatórios' },
        { status: 400 }
      )
    }

    const dateFrom = new Date(from)
    const dateTo = new Date(to)

    // Build filter
    const filterProduto: any = {
      ativo: true,
    }

    if (produtoId) {
      filterProduto.id = produtoId
    }

    // Get all products
    const produtos = await prisma.produto.findMany({
      where: filterProduto,
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
        },
      },
    })

    let totalVendas = 0
    let totalQuantidade = 0

    const produtosDetails: ProductDetail[] = produtos.map((p) => {
      const quantidadeVendas = p.transacoes.length
      const valorTotal = p.transacoes.reduce((sum, t) => sum + Number(t.valor), 0)
      const ticketMedio = quantidadeVendas > 0 ? valorTotal / quantidadeVendas : 0

      totalVendas += valorTotal
      totalQuantidade += quantidadeVendas

      return {
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        quantidadeVendas,
        valorTotal,
        ticketMedio,
        percentualVendas: 0, // Will be calculated after
      }
    })

    // Calculate percentages
    produtosDetails.forEach((p) => {
      p.percentualVendas = totalVendas > 0 ? (p.valorTotal / totalVendas) * 100 : 0
    })

    // Sort by total value (highest first)
    produtosDetails.sort((a, b) => b.valorTotal - a.valorTotal)

    const ticketMedio = totalQuantidade > 0 ? totalVendas / totalQuantidade : 0

    // Calculate monthly sales
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo })
    const vendasPorMes: MonthlySales[] = months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      let quantidadeMes = 0
      let valorMes = 0

      produtos.forEach((p) => {
        const vendasMes = p.transacoes.filter(
          (t) => t.data >= monthStart && t.data <= monthEnd
        )
        quantidadeMes += vendasMes.length
        valorMes += vendasMes.reduce((sum, t) => sum + Number(t.valor), 0)
      })

      return {
        mes: format(month, 'MMM/yyyy', { locale: ptBR }),
        quantidade: quantidadeMes,
        valor: valorMes,
      }
    })

    const productSalesData: ProductSalesData = {
      periodo: {
        from: dateFrom,
        to: dateTo,
      },
      produtos: produtosDetails,
      totalVendas,
      totalQuantidade,
      ticketMedio,
      resumoExecutivo: {
        produtoMaisVendido: produtosDetails[0]?.nome || 'N/A',
        maiorFaturamento: produtosDetails[0]?.nome || 'N/A',
        totalProdutos: produtosDetails.length,
      },
      vendasPorMes,
    }

    return NextResponse.json(productSalesData)
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de produtos' },
      { status: 500 }
    )
  }
}
