import { prisma } from "@/lib/prisma";

export async function saveMemory(data: {
  agentId: string;
  type: string;
  content: string;
  source?: string;
  tags?: string[];
}) {
  return prisma.agentMemory.create({
    data: {
      agentId: data.agentId,
      type: data.type,
      content: data.content,
      source: data.source || null,
      tags: data.tags || [],
    },
  });
}

export async function recallMemories(agentId: string, query: string, limit: number = 10) {
  // Simple keyword-based recall (can be upgraded to vector search later)
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);

  const memories = await prisma.agentMemory.findMany({
    where: {
      agentId,
      OR: keywords.map(keyword => ({
        OR: [
          { content: { contains: keyword, mode: "insensitive" as const } },
          { tags: { hasSome: [keyword] } },
        ],
      })),
    },
    orderBy: [{ relevance: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return memories;
}

export async function recallRecentMemories(agentId: string, limit: number = 5) {
  return prisma.agentMemory.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAgentMemoryStats(agentId: string) {
  const total = await prisma.agentMemory.count({ where: { agentId } });
  const byType = await prisma.agentMemory.groupBy({
    by: ["type"],
    where: { agentId },
    _count: true,
  });
  return { total, byType };
}

// Decay old memories (run periodically)
export async function decayMemories() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.agentMemory.updateMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
      relevance: { gt: 0.1 },
    },
    data: { relevance: { decrement: 0.1 } },
  });
}
