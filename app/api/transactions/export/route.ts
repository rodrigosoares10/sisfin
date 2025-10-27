import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions/export - Export transactions to CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids");

    let where: any = {};

    if (ids) {
      const transactionIds = ids.split(",").map((id) => parseInt(id));
      where.id = { in: transactionIds };
    }

    const transactions = await prisma.transacao.findMany({
      where,
      include: {
        centroCusto: true,
        cliente: true,
        produto: true,
      },
      orderBy: { data: "desc" },
    });

    // Generate CSV
    const headers = [
      "ID",
      "Data",
      "Descrição",
      "Tipo",
      "Valor",
      "Centro de Custo",
      "Cliente",
      "Produto",
      "Status",
      "Método de Pagamento",
      "Data Vencimento",
      "Data Pagamento",
    ];

    const rows = transactions.map((t: any) => [
      t.id,
      new Date(t.data).toLocaleDateString("pt-BR"),
      t.descricao,
      t.tipo,
      t.valor.toString(),
      t.centroCusto.nome,
      t.cliente?.nome || "",
      t.produto?.nome || "",
      t.statusPagamento,
      t.metodoPagamento,
      t.dataVencimento ? new Date(t.dataVencimento).toLocaleDateString("pt-BR") : "",
      t.dataPagamento ? new Date(t.dataPagamento).toLocaleDateString("pt-BR") : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transacoes_${new Date().toISOString()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}
