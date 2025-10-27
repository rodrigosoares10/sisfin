import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions/:id - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await prisma.transacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/:id - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const transaction = await prisma.transacao.update({
      where: { id: parseInt(id) },
      data: {
        tipo: body.tipo,
        descricao: body.descricao,
        valor: body.valor ? parseFloat(body.valor) : undefined,
        data: body.data ? new Date(body.data) : undefined,
        centroCustoId: body.centroCustoId ? parseInt(body.centroCustoId) : undefined,
        clienteId: body.clienteId ? parseInt(body.clienteId) : undefined,
        produtoId: body.produtoId ? parseInt(body.produtoId) : undefined,
        statusPagamento: body.statusPagamento,
        metodoPagamento: body.metodoPagamento,
        dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : undefined,
        dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : undefined,
        recorrente: body.recorrente,
        frequenciaRecorrencia: body.frequenciaRecorrencia,
        observacoes: body.observacoes,
        anexoUrl: body.anexoUrl,
      },
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/:id - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.transacao.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
