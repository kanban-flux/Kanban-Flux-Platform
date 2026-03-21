import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where = userId ? { members: { some: { userId } } } : {};

  const cards = await prisma.card.findMany({
    where,
    include: {
      column: {
        select: { title: true, board: { select: { id: true, name: true } } },
      },
      labels: { include: { label: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      checklists: { include: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(cards);
}
