import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalBoards, totalCards, totalMembers, columns, cards, recentCards] = await Promise.all([
    prisma.board.count(),
    prisma.card.count(),
    prisma.workspaceMember.count(),
    prisma.column.findMany({
      select: { title: true, _count: { select: { cards: true } } },
    }),
    prisma.card.findMany({
      select: {
        columnId: true,
        column: { select: { title: true } },
        createdAt: true,
        dueDate: true,
        checklists: { include: { items: true } },
      },
    }),
    prisma.card.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        column: { select: { title: true, board: { select: { name: true } } } },
      },
    }),
  ]);

  // Aggregate cards by status
  const statusCounts: Record<string, number> = {};
  columns.forEach((col) => {
    statusCounts[col.title] = (statusCounts[col.title] || 0) + col._count.cards;
  });

  // Overdue cards
  const now = new Date();
  const overdueCount = cards.filter(
    (c) => c.dueDate && new Date(c.dueDate) < now && c.column.title !== "Done"
  ).length;

  // Completion rate
  const doneCount = statusCounts["Done"] || 0;
  const completionRate = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  // Checklist progress
  let totalItems = 0;
  let completedItems = 0;
  cards.forEach((card) => {
    card.checklists.forEach((cl) => {
      totalItems += cl.items.length;
      completedItems += cl.items.filter((i) => i.completed).length;
    });
  });

  return NextResponse.json({
    totalBoards,
    totalCards,
    totalMembers,
    overdueCount,
    completionRate,
    statusCounts,
    checklistProgress: { total: totalItems, completed: completedItems },
    recentActivity: recentCards,
  });
}
