import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions - List transactions with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get("sortBy") || "data";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Filters
    const tipo = searchParams.get("tipo");
    const statusPagamento = searchParams.get("statusPagamento");
    const metodoPagamento = searchParams.get("metodoPagamento");
    const centroCustoId = searchParams.get("centroCustoId");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    // Build where clause
    const where: any = {};

    if (tipo) where.tipo = tipo;
    if (statusPagamento) where.statusPagamento = statusPagamento;
    if (metodoPagamento) where.metodoPagamento = metodoPagamento;
    if (centroCustoId) where.centroCustoId = parseInt(centroCustoId);

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    // Execute queries
    const [transactions, total] = await Promise.all([
      prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          centroCusto: true,
          cliente: true,
          produto: true,
        },
      }),
      prisma.transacao.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const transaction = await prisma.transacao.create({
      data: {
        tipo: body.tipo,
        descricao: body.descricao,
        valor: parseFloat(body.valor),
        data: new Date(body.data),
        centroCustoId: parseInt(body.centroCustoId),
        clienteId: body.clienteId ? parseInt(body.clienteId) : null,
        produtoId: body.produtoId ? parseInt(body.produtoId) : null,
        statusPagamento: body.statusPagamento || "PENDENTE",
        metodoPagamento: body.metodoPagamento,
        dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
        dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : null,
        recorrente: body.recorrente || false,
        frequenciaRecorrencia: body.frequenciaRecorrencia || null,
        observacoes: body.observacoes || null,
        anexoUrl: body.anexoUrl || null,
      },
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
