import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os centros de custo com estatísticas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()

    // Buscar centros de custo ordenados
    const centrosCusto = await prisma.centroCusto.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        transacoes: {
          where: {
            tipo: 'DESPESA',
            dataPagamento: {
              gte: new Date(anoAtual, mesAtual - 1, 1),
              lt: new Date(anoAtual, mesAtual, 1),
            },
          },
          select: {
            valor: true,
          },
        },
        metas: {
          where: {
            tipo: 'DESPESA',
            mes: mesAtual,
            ano: anoAtual,
          },
          select: {
            valor: true,
          },
        },
      },
    })

    // Calcular total geral de gastos
    const totalGeral = centrosCusto.reduce((acc, cc) => {
      const totalCentro = cc.transacoes.reduce((sum, t) => sum + Number(t.valor), 0)
      return acc + totalCentro
    }, 0)

    // Formatar resposta com estatísticas
    const centrosComStats = centrosCusto.map((cc) => {
      const totalGasto = cc.transacoes.reduce((sum, t) => sum + Number(t.valor), 0)
      const porcentagemTotal = totalGeral > 0 ? (totalGasto / totalGeral) * 100 : 0
      const metaMensal = cc.metas[0]?.valor ? Number(cc.metas[0].valor) : undefined
      const progressoMeta = metaMensal ? (totalGasto / metaMensal) * 100 : undefined

      return {
        id: cc.id,
        nome: cc.nome,
        descricao: cc.descricao,
        cor: cc.cor,
        ativo: cc.ativo,
        ordem: cc.ordem,
        criadoEm: cc.criadoEm,
        atualizadoEm: cc.atualizadoEm,
        totalGasto,
        porcentagemTotal,
        metaMensal,
        progressoMeta,
      }
    })

    return NextResponse.json(centrosComStats)
  } catch (error) {
    console.error('Erro ao buscar centros de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar centros de custo' },
      { status: 500 }
    )
  }
}

// POST - Criar novo centro de custo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, descricao, cor, ativo = true } = body

    // Validação
    if (!nome || !cor) {
      return NextResponse.json(
        { error: 'Nome e cor são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar a maior ordem atual
    const ultimoCentro = await prisma.centroCusto.findFirst({
      orderBy: { ordem: 'desc' },
    })

    const novaOrdem = (ultimoCentro?.ordem || 0) + 1

    // Criar centro de custo
    const centroCusto = await prisma.centroCusto.create({
      data: {
        nome,
        descricao,
        cor,
        ativo,
        ordem: novaOrdem,
      },
    })

    return NextResponse.json(centroCusto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar centro de custo' },
      { status: 500 }
    )
  }
}

// PATCH - Reordenar centros de custo
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { reordenacao } = body // Array de { id, ordem }

    if (!Array.isArray(reordenacao)) {
      return NextResponse.json(
        { error: 'Reordenação deve ser um array' },
        { status: 400 }
      )
    }

    // Atualizar ordem de cada centro de custo
    await Promise.all(
      reordenacao.map((item) =>
        prisma.centroCusto.update({
          where: { id: item.id },
          data: { ordem: item.ordem },
        })
      )
    )

    return NextResponse.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao reordenar centros de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar centros de custo' },
      { status: 500 }
    )
  }
}
