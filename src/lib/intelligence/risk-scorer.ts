import { prisma } from "@/lib/prisma";

export async function calculateCardRisk(cardId: string): Promise<number> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      dependencies: true,
      members: true,
      checklists: { include: { items: true } },
    },
  });

  if (!card) return 0;

  let risk = 0;

  // Complexity (description length)
  if ((card.description?.length || 0) > 500) risk += 15;
  else if ((card.description?.length || 0) > 200) risk += 8;

  // Dependencies increase risk
  risk += Math.min(30, card.dependencies.length * 10);

  // No members assigned = higher risk
  if (card.members.length === 0) risk += 20;

  // Overdue
  if (card.dueDate && new Date(card.dueDate) < new Date()) risk += 25;

  // Incomplete checklists
  const totalItems = card.checklists.reduce((s, cl) => s + cl.items.length, 0);
  const completedItems = card.checklists.reduce((s, cl) => s + cl.items.filter(i => i.completed).length, 0);
  if (totalItems > 0 && completedItems / totalItems < 0.5) risk += 10;

  // Priority
  if (card.priority === 0) risk += 15; // P0 = high risk
  else if (card.priority === 1) risk += 10;

  return Math.min(100, risk);
}

export async function updateProjectRiskScores(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { boards: { include: { columns: { include: { cards: { select: { id: true } } } } } } },
  });

  if (!project) return;

  for (const board of project.boards) {
    for (const col of board.columns) {
      for (const card of col.cards) {
        const risk = await calculateCardRisk(card.id);
        await prisma.card.update({
          where: { id: card.id },
          data: { riskScore: risk },
        });
      }
    }
  }
}
