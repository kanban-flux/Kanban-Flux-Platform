import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: params.id },
    include: {
      cards: {
        include: {
          card: {
            include: {
              labels: { include: { label: true } },
              members: {
                include: {
                  user: { select: { id: true, name: true, avatar: true, isAgent: true } },
                },
              },
              column: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  if (!sprint) {
    return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
  }

  return NextResponse.json(sprint);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.status !== undefined) data.status = body.status;
  if (body.goal !== undefined) data.goal = body.goal;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);

  const sprint = await prisma.sprint.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(sprint);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.sprint.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
