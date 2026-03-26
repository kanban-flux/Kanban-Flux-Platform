import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { cardId } = body;

  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  const sprintCard = await prisma.sprintCard.upsert({
    where: {
      sprintId_cardId: { sprintId: params.id, cardId },
    },
    create: { sprintId: params.id, cardId },
    update: {},
  });

  return NextResponse.json(sprintCard, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get("cardId");

  if (!cardId) {
    return NextResponse.json({ error: "cardId query param is required" }, { status: 400 });
  }

  await prisma.sprintCard.delete({
    where: {
      sprintId_cardId: { sprintId: params.id, cardId },
    },
  });

  return NextResponse.json({ success: true });
}
