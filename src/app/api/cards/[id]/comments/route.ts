import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const comments = await prisma.comment.findMany({
    where: { cardId: params.id },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const comment = await prisma.comment.create({
    data: {
      text: body.text,
      userId: body.userId,
      cardId: params.id,
    },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  // Check if this is a human comment on a card with an agent assigned
  try {
    const card = await prisma.card.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, isAgent: true } },
          },
        },
      },
    });

    const commenter = await prisma.user.findUnique({
      where: { id: body.userId },
    });
    const isHumanComment = commenter && !commenter.isAgent;
    const agentMember = card?.members.find((m) => m.user.isAgent);

    if (isHumanComment && agentMember) {
      // Find the agent
      const agent = await prisma.agent.findFirst({
        where: { userId: agentMember.user.id },
      });

      if (agent) {
        // Create a run for the agent to respond to the comment
        const run = await prisma.agentRun.create({
          data: {
            agentId: agent.id,
            cardId: params.id,
            status: "QUEUED",
          },
        });

        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: "WORKING" },
        });

        try {
          const { enqueueAgentRun } = await import("@/lib/agents/queue");
          await enqueueAgentRun(run.id);
        } catch (e) {
          console.error("Failed to enqueue agent response:", e);
        }
      }
    }
  } catch (e) {
    // Don't fail the comment creation if agent triggering fails
    console.error("Failed to trigger agent response to comment:", e);
  }

  return NextResponse.json(comment, { status: 201 });
}
