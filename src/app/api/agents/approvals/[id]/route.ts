import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status, resolvedBy } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const gate = await prisma.approvalGate.update({
    where: { id: params.id },
    data: { status, resolvedAt: new Date(), resolvedBy },
  });

  return NextResponse.json(gate);
}
