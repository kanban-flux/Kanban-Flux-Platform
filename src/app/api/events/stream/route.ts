import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

      const sendEvent = (type: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial heartbeat
      sendEvent("connected", { timestamp: new Date().toISOString() });

      // Poll for changes every 3 seconds
      const interval = setInterval(async () => {
        try {
          // Check for new agent runs
          const newRuns = await prisma.agentRun.findMany({
            where: { updatedAt: { gt: lastCheck } },
            include: {
              agent: { include: { user: { select: { name: true } } } },
              card: { select: { id: true, title: true } },
            },
            take: 10,
          });

          for (const run of newRuns) {
            sendEvent("agent_run", {
              id: run.id,
              status: run.status,
              agent: run.agent.user.name,
              role: run.agent.role,
              card: run.card.title,
              cardId: run.card.id,
            });
          }

          // Check for new comments
          const newComments = await prisma.comment.findMany({
            where: { createdAt: { gt: lastCheck } },
            include: {
              user: { select: { name: true, isAgent: true } },
              card: { select: { id: true, title: true } },
            },
            take: 10,
          });

          for (const comment of newComments) {
            sendEvent("comment", {
              cardId: comment.card.id,
              cardTitle: comment.card.title,
              user: comment.user.name,
              isAgent: comment.user.isAgent,
              text: comment.text.substring(0, 200),
            });
          }

          // Check for card movements
          const movedCards = await prisma.card.findMany({
            where: { updatedAt: { gt: lastCheck } },
            include: { column: { select: { title: true } } },
            take: 10,
          });

          for (const card of movedCards) {
            sendEvent("card_update", {
              id: card.id,
              title: card.title,
              column: card.column.title,
            });
          }

          lastCheck = new Date();

          // Heartbeat
          sendEvent("heartbeat", { timestamp: new Date().toISOString() });
        } catch (error) {
          console.error("SSE poll error:", error);
        }
      }, 3000);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
