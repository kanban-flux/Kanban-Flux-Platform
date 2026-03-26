import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_WORKSPACE_ID = "default-workspace";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const template = await prisma.teamTemplate.findUnique({
    where: { id: params.id },
  });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const agentConfigs = template.agents as Record<string, unknown>[];
  const created: { role: string; status: string; id: string }[] = [];

  // Get first available API key
  const apiKey = await prisma.agentApiKey.findFirst();

  for (const config of agentConfigs) {
    const role = config.role as string;
    const name = config.name as string;
    const provider = config.provider as string;
    const model = config.model as string;
    const capabilities = config.capabilities as string[];
    const systemPromptSummary = config.systemPromptSummary as string;

    // Check if agent with this role already exists
    const existing = await prisma.agent.findFirst({ where: { role } });
    if (existing) {
      created.push({ role, status: "already_exists", id: existing.id });
      continue;
    }

    // Create user for agent
    const user = await prisma.user.create({
      data: {
        name,
        email: `${role}-agent-${Date.now()}@agents.kanbanflux.ai`,
        isAgent: true,
      },
    });

    // Ensure workspace exists
    const workspace = await prisma.workspace.upsert({
      where: { id: DEFAULT_WORKSPACE_ID },
      create: { id: DEFAULT_WORKSPACE_ID, name: "Default Workspace" },
      update: {},
    });

    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "MEMBER",
      },
    });

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        provider: provider as "CLAUDE" | "GEMINI" | "OPENAI" | "CUSTOM",
        model,
        role,
        systemPrompt: systemPromptSummary,
        capabilities,
        apiKeyId: apiKey?.id || null,
      },
    });

    created.push({ role, status: "created", id: agent.id });
  }

  // Increment usage count
  await prisma.teamTemplate.update({
    where: { id: params.id },
    data: { usageCount: { increment: 1 } },
  });

  return NextResponse.json(
    { templateName: template.name, agents: created },
    { status: 201 }
  );
}
