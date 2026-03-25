import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const status = new URL(req.url).searchParams.get("status") || "PENDING";

  const gates = await prisma.approvalGate.findMany({
    where: { status },
    include: {
      agent: { include: { user: { select: { name: true } } } },
      run: { include: { card: { select: { id: true, title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(gates);
}
