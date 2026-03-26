import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const { cards } = await req.json();

  // Capture old column IDs before the transaction so we can detect column changes
  const oldColumns = new Map<string, string>();
  for (const c of cards as { id: string; columnId: string; position: number }[]) {
    const existing = await prisma.card.findUnique({
      where: { id: c.id },
      select: { columnId: true },
    });
    if (existing) oldColumns.set(c.id, existing.columnId);
  }

  await prisma.$transaction(
    cards.map((card: { id: string; columnId: string; position: number }) =>
      prisma.card.update({
        where: { id: card.id },
        data: { columnId: card.columnId, position: card.position },
      })
    )
  );

  // Auto-trigger agents for cards that changed columns
  for (const c of cards as { id: string; columnId: string; position: number }[]) {
    const oldCol = oldColumns.get(c.id);
    if (oldCol && c.columnId && c.columnId !== oldCol) {
      import("@/lib/agents/auto-trigger").then(({ handleCardColumnChange }) => {
        handleCardColumnChange(c.id, c.columnId, oldCol).catch(console.error);
      });
    }
  }

  return NextResponse.json({ success: true });
}
