import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/transactions/bulk - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const transactionIds = ids.map((id) => parseInt(id));

    switch (action) {
      case "markAsPaid":
        await prisma.transacao.updateMany({
          where: { id: { in: transactionIds } },
          data: {
            statusPagamento: "PAGO",
            dataPagamento: new Date(),
          },
        });
        return NextResponse.json({ message: "Transactions marked as paid" });

      case "delete":
        await prisma.transacao.deleteMany({
          where: { id: { in: transactionIds } },
        });
        return NextResponse.json({ message: "Transactions deleted" });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
