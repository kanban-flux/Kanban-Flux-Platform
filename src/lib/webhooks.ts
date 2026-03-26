import { prisma } from "@/lib/prisma";

export async function fireWebhook(projectId: string, event: string, data: Record<string, unknown>) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      projectId,
      active: true,
      events: { has: event },
    },
  });

  for (const webhook of webhooks) {
    try {
      // Format for Slack/Discord
      const payload = {
        // Discord format
        content: undefined as string | undefined,
        embeds: [{
          title: `Kanban Flux: ${event.replace(/_/g, " ")}`,
          description: formatEventMessage(event, data),
          color: getEventColor(event),
          timestamp: new Date().toISOString(),
          footer: { text: "Kanban Flux AI" },
        }],
        // Slack format
        text: formatEventMessage(event, data),
        blocks: [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${event.replace(/_/g, " ").toUpperCase()}*\n${formatEventMessage(event, data)}`,
          },
        }],
      };

      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(`Webhook ${webhook.id} failed:`, err);
    }
  }
}

function formatEventMessage(event: string, data: Record<string, unknown>): string {
  switch (event) {
    case "card_moved":
      return `Card "${data.cardTitle}" moved to ${data.column} by ${data.agent || "user"}`;
    case "agent_completed":
      return `Agent ${data.agent} completed task "${data.cardTitle}" (${data.tokens} tokens, $${data.cost})`;
    case "comment_added":
      return `${data.user} commented on "${data.cardTitle}": ${(data.text as string)?.substring(0, 100)}`;
    case "approval_required":
      return `Approval needed: ${data.agent} wants to ${data.action} - ${data.description}`;
    case "run_failed":
      return `Agent ${data.agent} failed on "${data.cardTitle}": ${data.error}`;
    case "sla_overdue":
      return `Card "${data.cardTitle}" is overdue (due: ${data.dueDate})`;
    default:
      return JSON.stringify(data);
  }
}

function getEventColor(event: string): number {
  const colors: Record<string, number> = {
    card_moved: 0x3B82F6,      // blue
    agent_completed: 0x22C55E,  // green
    comment_added: 0x8B5CF6,   // purple
    approval_required: 0xF59E0B, // amber
    run_failed: 0xEF4444,      // red
    sla_overdue: 0xEF4444,     // red
  };
  return colors[event] || 0x6B7280;
}
