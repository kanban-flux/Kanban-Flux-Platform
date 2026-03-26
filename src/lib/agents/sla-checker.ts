import { prisma } from "@/lib/prisma";

export async function checkSLAAlerts() {
  const now = new Date();

  // Find cards that are overdue
  const overdueCards = await prisma.card.findMany({
    where: {
      dueDate: { lt: now },
      column: { title: { not: "Done" } },
    },
    include: {
      column: { include: { board: { select: { projectId: true } } } },
      members: { include: { user: { select: { id: true, isAgent: true } } } },
    },
  });

  for (const card of overdueCards) {
    // Create notification for non-agent members
    for (const member of card.members) {
      if (!member.user.isAgent) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: member.user.id,
            cardId: card.id,
            type: "sla_overdue",
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // last 24h
          },
        });
        if (!existing) {
          await prisma.notification.create({
            data: {
              userId: member.user.id,
              type: "sla_overdue",
              title: "Card overdue",
              message: `"${card.title}" was due ${card.dueDate?.toLocaleDateString()}`,
              cardId: card.id,
            },
          });
        }
      }
    }

    // Fire webhook if project has one
    if (card.column.board.projectId) {
      const { fireWebhook } = await import("@/lib/webhooks");
      await fireWebhook(card.column.board.projectId, "sla_overdue", {
        cardTitle: card.title,
        dueDate: card.dueDate?.toISOString(),
      });
    }
  }

  // Find stale cards (not updated in 2+ days, not in Done)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const staleCards = await prisma.card.findMany({
    where: {
      updatedAt: { lt: twoDaysAgo },
      column: { title: { notIn: ["Done", "Todo"] } },
    },
    select: { id: true, title: true },
    take: 20,
  });

  return { overdueCount: overdueCards.length, staleCount: staleCards.length };
}
