import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const webhooks = await prisma.webhook.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(webhooks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, url, events } = body as {
    name: string;
    url: string;
    events: string[];
  };

  if (!name || !url || !events || events.length === 0) {
    return NextResponse.json(
      { error: "name, url, and events are required" },
      { status: 400 }
    );
  }

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      projectId: id,
      name,
      url,
      events,
    },
  });

  return NextResponse.json(webhook, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get("webhookId");

  if (!webhookId) {
    return NextResponse.json(
      { error: "webhookId query parameter is required" },
      { status: 400 }
    );
  }

  // Verify webhook belongs to project
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, projectId: id },
  });

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id: webhookId } });

  return NextResponse.json({ success: true });
}
