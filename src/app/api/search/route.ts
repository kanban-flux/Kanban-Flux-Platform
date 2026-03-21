import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ boards: [], cards: [], members: [] });
  }

  const [boards, cards, members] = await Promise.all([
    prisma.board.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        updatedAt: true,
      },
      take: 5,
    }),
    prisma.card.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        column: {
          select: {
            title: true,
            board: { select: { id: true, name: true } },
          },
        },
        labels: { include: { label: true } },
      },
      take: 10,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ boards, cards, members });
}
