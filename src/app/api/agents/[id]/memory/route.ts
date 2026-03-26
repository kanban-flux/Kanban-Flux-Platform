import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const query = new URL(req.url).searchParams.get("query");

  if (query) {
    const { recallMemories } = await import("@/lib/agents/memory");
    const memories = await recallMemories(params.id, query);
    return NextResponse.json(memories);
  }

  const memories = await prisma.agentMemory.findMany({
    where: { agentId: params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(memories);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { type, content, tags } = await req.json();
  const { saveMemory } = await import("@/lib/agents/memory");
  const memory = await saveMemory({
    agentId: params.id,
    type,
    content,
    tags: tags || [],
  });
  return NextResponse.json(memory, { status: 201 });
}
