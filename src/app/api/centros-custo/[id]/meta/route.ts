import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Criar ou atualizar meta para o centro de custo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { valor, mes, ano, descricao } = body

    // Validação
    if (!valor || !mes || !ano) {
      return NextResponse.json(
        { error: 'Valor, mês e ano são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o centro de custo existe
    const centroCusto = await prisma.centroCusto.findUnique({
      where: { id: params.id },
    })

    if (!centroCusto) {
      return NextResponse.json(
        { error: 'Centro de custo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe uma meta para este período
    const metaExistente = await prisma.meta.findFirst({
      where: {
        centroCustoId: params.id,
        tipo: 'DESPESA',
        mes,
        ano,
      },
    })

    let meta
    if (metaExistente) {
      // Atualizar meta existente
      meta = await prisma.meta.update({
        where: { id: metaExistente.id },
        data: {
          valor,
          descricao,
        },
      })
    } else {
      // Criar nova meta
      meta = await prisma.meta.create({
        data: {
          tipo: 'DESPESA',
          valor,
          mes,
          ano,
          descricao,
          centroCustoId: params.id,
          atingida: false,
        },
      })
    }

    return NextResponse.json(meta, { status: metaExistente ? 200 : 201 })
  } catch (error) {
    console.error('Erro ao criar/atualizar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar/atualizar meta' },
      { status: 500 }
    )
  }
}

// GET - Buscar meta do centro de custo para um período
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mes = parseInt(searchParams.get('mes') || String(new Date().getMonth() + 1))
    const ano = parseInt(searchParams.get('ano') || String(new Date().getFullYear()))

    const meta = await prisma.meta.findFirst({
      where: {
        centroCustoId: params.id,
        tipo: 'DESPESA',
        mes,
        ano,
      },
    })

    if (!meta) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(meta)
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar meta' },
      { status: 500 }
    )
  }
}

// DELETE - Remover meta do centro de custo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mes = parseInt(searchParams.get('mes') || String(new Date().getMonth() + 1))
    const ano = parseInt(searchParams.get('ano') || String(new Date().getFullYear()))

    const meta = await prisma.meta.findFirst({
      where: {
        centroCustoId: params.id,
        tipo: 'DESPESA',
        mes,
        ano,
      },
    })

    if (!meta) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    await prisma.meta.delete({
      where: { id: meta.id },
    })

    return NextResponse.json({ message: 'Meta removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover meta:', error)
    return NextResponse.json(
      { error: 'Erro ao remover meta' },
      { status: 500 }
    )
  }
}
