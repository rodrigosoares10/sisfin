import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const costCenters = await prisma.centroCusto.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(costCenters);
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost centers" },
      { status: 500 }
    );
  }
}
