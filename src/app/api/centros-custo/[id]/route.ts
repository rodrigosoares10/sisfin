import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar centro de custo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const centroCusto = await prisma.centroCusto.findUnique({
      where: { id: params.id },
    })

    if (!centroCusto) {
      return NextResponse.json(
        { error: 'Centro de custo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(centroCusto)
  } catch (error) {
    console.error('Erro ao buscar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar centro de custo' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar centro de custo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nome, descricao, cor, ativo, ordem } = body

    // Verificar se existe
    const centroCustoExistente = await prisma.centroCusto.findUnique({
      where: { id: params.id },
    })

    if (!centroCustoExistente) {
      return NextResponse.json(
        { error: 'Centro de custo não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar
    const centroCusto = await prisma.centroCusto.update({
      where: { id: params.id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(cor !== undefined && { cor }),
        ...(ativo !== undefined && { ativo }),
        ...(ordem !== undefined && { ordem }),
      },
    })

    return NextResponse.json(centroCusto)
  } catch (error) {
    console.error('Erro ao atualizar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar centro de custo' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar centro de custo (soft delete - apenas desativar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se existe
    const centroCustoExistente = await prisma.centroCusto.findUnique({
      where: { id: params.id },
    })

    if (!centroCustoExistente) {
      return NextResponse.json(
        { error: 'Centro de custo não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - apenas desativar
    const centroCusto = await prisma.centroCusto.update({
      where: { id: params.id },
      data: { ativo: false },
    })

    return NextResponse.json(centroCusto)
  } catch (error) {
    console.error('Erro ao deletar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar centro de custo' },
      { status: 500 }
    )
  }
}
