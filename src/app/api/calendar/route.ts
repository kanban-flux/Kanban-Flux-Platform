import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const cards = await prisma.card.findMany({
    where: {
      dueDate: { gte: startDate, lte: endDate },
    },
    include: {
      column: {
        select: { title: true, board: { select: { id: true, name: true } } },
      },
      labels: { include: { label: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(cards);
}
