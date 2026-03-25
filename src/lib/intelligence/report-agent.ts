import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/agents/crypto";

interface ReportSection {
  title: string;
  content: string;
}

// Tools the report agent can use
async function searchGraph(projectId: string, query: string) {
  const nodes = await prisma.graphNode.findMany({
    where: {
      projectId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { type: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 20,
  });
  const edges = await prisma.graphEdge.findMany({
    where: {
      projectId,
      OR: [
        { relation: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      source: { select: { name: true, type: true } },
      target: { select: { name: true, type: true } },
    },
    take: 20,
  });
  return { nodes, edges };
}

async function getProjectOverview(projectId: string) {
  const nodeCount = await prisma.graphNode.count({ where: { projectId } });
  const edgeCount = await prisma.graphEdge.count({ where: { projectId } });
  const nodesByType = await prisma.graphNode.groupBy({
    by: ["type"],
    where: { projectId },
    _count: true,
  });
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      boards: {
        include: {
          columns: {
            include: { cards: { include: { members: { include: { user: { select: { name: true, isAgent: true } } } } } } },
          },
        },
      },
    },
  });

  let totalCards = 0, todoCards = 0, inProgressCards = 0, doneCards = 0;
  const agentSet = new Set<string>();

  project?.boards.forEach(b => b.columns.forEach(c => {
    c.cards.forEach(card => {
      totalCards++;
      if (c.title.toLowerCase().includes("to do")) todoCards++;
      else if (c.title.toLowerCase().includes("progress")) inProgressCards++;
      else if (c.title.toLowerCase().includes("done")) doneCards++;
      card.members.filter(m => m.user.isAgent).forEach(m => agentSet.add(m.user.name));
    });
  }));

  return {
    nodeCount, edgeCount, nodesByType,
    projectName: project?.name,
    totalCards, todoCards, inProgressCards, doneCards,
    completionRate: totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0,
    activeAgents: Array.from(agentSet),
  };
}

async function getSimulationPredictions(projectId: string) {
  const latestSim = await prisma.simulation.findFirst({
    where: { projectId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  return latestSim?.predictions || null;
}

async function getRecentAgentActivity(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { boards: { select: { id: true } } },
  });
  if (!project) return [];

  const boardIds = project.boards.map(b => b.id);
  const runs = await prisma.agentRun.findMany({
    where: { card: { column: { boardId: { in: boardIds } } } },
    include: {
      agent: { include: { user: { select: { name: true } } } },
      card: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return runs.map(r => ({
    agent: r.agent.user.name,
    role: r.agent.role,
    card: r.card.title,
    status: r.status,
    tokens: r.tokenUsage,
    cost: r.cost,
  }));
}

export async function generateReport(projectId: string): Promise<{ sections: ReportSection[]; generatedAt: string }> {
  // Gather all intelligence
  const [overview, predictions, activity] = await Promise.all([
    getProjectOverview(projectId),
    getSimulationPredictions(projectId),
    getRecentAgentActivity(projectId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const graphData = await searchGraph(projectId, "");

  // Try to use LLM for report generation, fall back to structured report
  let sections: ReportSection[] = [];

  try {
    const apiKeyRecord = await prisma.agentApiKey.findFirst({ where: { provider: "GEMINI" } });
    if (apiKeyRecord) {
      const apiKey = decrypt(apiKeyRecord.encryptedKey, apiKeyRecord.iv);
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a project intelligence analyst. Generate a concise project report based on this data.

PROJECT: ${overview.projectName}
CARDS: ${overview.totalCards} total (To Do: ${overview.todoCards}, In Progress: ${overview.inProgressCards}, Done: ${overview.doneCards})
COMPLETION: ${overview.completionRate}%
AGENTS: ${overview.activeAgents.join(", ") || "None assigned"}
GRAPH: ${overview.nodeCount} nodes, ${overview.edgeCount} edges
TYPES: ${overview.nodesByType.map(t => t.type + ": " + t._count).join(", ")}

SIMULATION PREDICTIONS: ${predictions ? JSON.stringify(predictions) : "No simulation run yet"}

RECENT ACTIVITY: ${activity.map(a => `${a.agent} (${a.role}): ${a.status} on "${a.card}"`).join("; ") || "No recent activity"}

Generate a report with these sections (use markdown):
1. Executive Summary (2-3 sentences)
2. Project Health (status, risks, blockers)
3. Team Performance (agent utilization, completions)
4. Predictions & Timeline (based on simulation data if available)
5. Recommendations (3-5 actionable items)

Be concise and actionable. Use bullet points.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse sections from markdown
      const sectionRegex = /##?\s*\d*\.?\s*(.+?)\n([\s\S]*?)(?=##?\s*\d*\.?\s|$)/g;
      let match;
      while ((match = sectionRegex.exec(text)) !== null) {
        sections.push({ title: match[1].trim(), content: match[2].trim() });
      }

      if (sections.length === 0) {
        sections.push({ title: "Project Report", content: text });
      }
    }
  } catch (error) {
    console.error("LLM report generation failed, using structured fallback:", error);
  }

  // Fallback: structured report without LLM
  if (sections.length === 0) {
    sections = [
      {
        title: "Executive Summary",
        content: `**${overview.projectName}** has ${overview.totalCards} tasks with ${overview.completionRate}% completion rate. ${overview.activeAgents.length} AI agents are assigned to the project.`,
      },
      {
        title: "Project Health",
        content: `- **To Do:** ${overview.todoCards} tasks\n- **In Progress:** ${overview.inProgressCards} tasks\n- **Done:** ${overview.doneCards} tasks\n- **Knowledge Graph:** ${overview.nodeCount} nodes, ${overview.edgeCount} edges`,
      },
      {
        title: "Team Performance",
        content: activity.length > 0
          ? activity.map(a => `- **${a.agent}** (${a.role}): ${a.status} on "${a.card}" (${a.tokens || 0} tokens, $${(a.cost || 0).toFixed(4)})`).join("\n")
          : "No recent agent activity recorded.",
      },
      {
        title: "Predictions",
        content: predictions
          ? `- **Estimated completion:** ${(predictions as Record<string, unknown>).estimatedRoundsToComplete || "?"} rounds\n- **Completion rate:** ${(predictions as Record<string, unknown>).completionRate || 0}%\n- **Bottlenecks:** ${((predictions as Record<string, unknown>).bottlenecks as Array<{ agent: string }> || []).map((b) => b.agent).join(", ") || "None detected"}`
          : "Run a simulation to generate predictions.",
      },
      {
        title: "Recommendations",
        content: predictions
          ? ((predictions as Record<string, unknown>).recommendations as string[] || []).map((r) => `- ${r}`).join("\n")
          : "- Run a simulation to get AI-powered recommendations\n- Assign agents to unassigned tasks\n- Build the knowledge graph for dependency analysis",
      },
    ];
  }

  return { sections, generatedAt: new Date().toISOString() };
}
