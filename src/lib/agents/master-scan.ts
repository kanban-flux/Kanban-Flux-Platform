import { prisma } from "@/lib/prisma";

/**
 * Master Orchestrator scan: finds unassigned cards, assigns agents,
 * and triggers work to ensure projects reach completion.
 */
export async function masterOrchestratorScan() {
  // Find the Master agent
  const master = await prisma.agent.findFirst({
    where: { role: "master" },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!master) {
    console.log("[Master Scan] No master agent found");
    return { error: "No master agent" };
  }

  // Get all active projects with boards
  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE", autoTrigger: true },
    include: {
      boards: {
        include: {
          columns: {
            orderBy: { position: "asc" },
            include: {
              cards: {
                include: {
                  members: { include: { user: { select: { id: true, name: true, isAgent: true } } } },
                  labels: { include: { label: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  // Get all available agents
  const agents = await prisma.agent.findMany({
    where: { status: { not: "ERROR" } },
    include: { user: { select: { id: true, name: true } } },
  });

  let assigned = 0;
  let triggered = 0;
  let commented = 0;

  for (const project of projects) {
    for (const board of project.boards) {
      for (const col of board.columns) {
        const colName = col.title.toLowerCase();
        if (colName === "done") continue; // Skip done cards

        for (const card of col.cards) {
          const hasAgent = card.members.some(m => m.user.isAgent);

          // === UNASSIGNED CARDS: Master assigns the right agent ===
          if (!hasAgent && colName !== "bug") {
            const bestAgent = findBestAgent(card, agents);
            if (bestAgent) {
              // Assign agent to card
              await prisma.cardMember.upsert({
                where: { cardId_userId: { cardId: card.id, userId: bestAgent.user.id } },
                create: { cardId: card.id, userId: bestAgent.user.id },
                update: {},
              });

              // Post assignment comment
              await prisma.comment.create({
                data: {
                  text: `**Master Orchestrator:** Assigned **${bestAgent.user.name}** (${bestAgent.role}) to this task.`,
                  userId: master.user.id,
                  cardId: card.id,
                },
              });

              assigned++;

              // Auto-trigger the assigned agent
              const activeRuns = await prisma.agentRun.count({
                where: { agentId: bestAgent.id, status: { in: ["QUEUED", "RUNNING"] } },
              });

              if (activeRuns < bestAgent.maxConcurrent) {
                const run = await prisma.agentRun.create({
                  data: { agentId: bestAgent.id, cardId: card.id, status: "QUEUED" },
                });
                await prisma.agent.update({
                  where: { id: bestAgent.id },
                  data: { status: "WORKING" },
                });
                try {
                  const { enqueueAgentRun } = await import("./queue");
                  await enqueueAgentRun(run.id);
                  triggered++;
                } catch {}
              }
            }
          }

          // === BUG CARDS: Master reassigns to original dev ===
          if (colName === "bug") {
            const devAgent = card.members.find(m => m.user.isAgent);
            if (devAgent) {
              const agent = agents.find(a => a.userId === devAgent.user.id);
              if (agent) {
                const activeRun = await prisma.agentRun.findFirst({
                  where: { agentId: agent.id, cardId: card.id, status: { in: ["QUEUED", "RUNNING"] } },
                });
                if (!activeRun) {
                  const run = await prisma.agentRun.create({
                    data: { agentId: agent.id, cardId: card.id, status: "QUEUED" },
                  });
                  try {
                    const { enqueueAgentRun } = await import("./queue");
                    await enqueueAgentRun(run.id);
                    triggered++;
                  } catch {}
                }
              }
            }
          }

          // === STALE CARDS: Cards in In Progress with agent but no recent activity ===
          if (hasAgent && colName === "in progress") {
            const lastRun = await prisma.agentRun.findFirst({
              where: { cardId: card.id },
              orderBy: { updatedAt: "desc" },
            });

            // If last run was more than 30 min ago and not active, re-trigger
            if (lastRun && !["QUEUED", "RUNNING"].includes(lastRun.status)) {
              const minutesAgo = (Date.now() - new Date(lastRun.updatedAt).getTime()) / 60000;
              if (minutesAgo > 30) {
                const agentMember = card.members.find(m => m.user.isAgent);
                const agent = agentMember ? agents.find(a => a.userId === agentMember.user.id) : null;
                if (agent) {
                  const run = await prisma.agentRun.create({
                    data: { agentId: agent.id, cardId: card.id, status: "QUEUED" },
                  });
                  try {
                    const { enqueueAgentRun } = await import("./queue");
                    await enqueueAgentRun(run.id);
                    triggered++;

                    await prisma.comment.create({
                      data: {
                        text: `**Master Orchestrator:** This task appears stale. Re-triggering **${agent.user.name}** to continue work.`,
                        userId: master.user.id,
                        cardId: card.id,
                      },
                    });
                    commented++;
                  } catch {}
                }
              }
            }
          }
        }
      }
    }
  }

  return { assigned, triggered, commented, projectsScanned: projects.length };
}

function findBestAgent(
  card: { title: string; description: string | null; labels: { label: { name: string } }[] },
  agents: { id: string; userId: string; role: string; maxConcurrent: number; user: { id: string; name: string } }[]
): typeof agents[0] | null {
  const ROLE_LABELS: Record<string, string[]> = {
    frontend: ["frontend", "design", "ui", "ux", "css", "react", "landing", "hero", "section"],
    backend: ["backend", "api", "database", "server", "node", "endpoint", "auth"],
    qa: ["qa", "testing", "test", "quality", "validation", "review"],
    architect: ["architecture", "system", "design"],
    devops: ["devops", "ci/cd", "docker", "deploy", "infrastructure"],
    dba: ["database", "sql", "dba", "schema", "migration"],
    analyst: ["analysis", "research", "market", "ai/ml", "briefing"],
  };

  const cardLabels = card.labels.map(l => l.label.name.toLowerCase());
  const cardText = `${card.title} ${card.description || ""}`.toLowerCase();
  let bestRole = "";
  let bestScore = 0;

  for (const [role, keywords] of Object.entries(ROLE_LABELS)) {
    let score = 0;
    for (const kw of keywords) {
      if (cardLabels.some(l => l.includes(kw))) score += 3;
      if (cardText.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }

  if (!bestRole) bestRole = "frontend"; // default

  return agents.find(a => a.role === bestRole) || agents[0] || null;
}
