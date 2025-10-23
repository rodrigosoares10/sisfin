import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const receitaTotal = produto.transacoes.reduce(
      (sum, t) => sum + Number(t.valor),
      0
    )

    return NextResponse.json({
      ...produto,
      valor: Number(produto.valor),
      salesCount: produto._count.transacoes,
      totalRevenue: receitaTotal
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nome, tipo, valor, descricao, ativo } = body

    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: {
        ...(nome && { nome }),
        ...(tipo && { tipo }),
        ...(valor !== undefined && { valor: new Prisma.Decimal(valor) }),
        ...(descricao !== undefined && { descricao }),
        ...(ativo !== undefined && { ativo })
      }
    })

    return NextResponse.json({
      ...produto,
      valor: Number(produto.valor)
    })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.produto.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    )
  }
}
