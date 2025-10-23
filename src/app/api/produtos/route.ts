import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') as 'UNICO' | 'MRR' | null
    const ativo = searchParams.get('ativo')

    const where: Prisma.ProdutoWhereInput = {}

    if (tipo) {
      where.tipo = tipo
    }

    if (ativo !== null) {
      where.ativo = ativo === 'true'
    }

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        _count: {
          select: { transacoes: true }
        },
        transacoes: {
          where: {
            tipo: 'RECEITA',
            statusPagamento: 'PAGO'
          },
          select: {
            valor: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats for each product
    const produtosComStats = produtos.map(produto => {
      const receitaTotal = produto.transacoes.reduce(
        (sum, t) => sum + Number(t.valor),
        0
      )

      return {
        id: produto.id,
        nome: produto.nome,
        tipo: produto.tipo,
        valor: Number(produto.valor),
        descricao: produto.descricao,
        ativo: produto.ativo,
        createdAt: produto.createdAt,
        updatedAt: produto.updatedAt,
        salesCount: produto._count.transacoes,
        totalRevenue: receitaTotal
      }
    })

    return NextResponse.json(produtosComStats)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, tipo, valor, descricao, ativo } = body

    if (!nome || !tipo || valor === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, tipo, valor' },
        { status: 400 }
      )
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        tipo,
        valor: new Prisma.Decimal(valor),
        descricao: descricao || null,
        ativo: ativo ?? true
      }
    })

    return NextResponse.json({
      ...produto,
      valor: Number(produto.valor)
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
