import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const member = await prisma.workspaceMember.update({
    where: { id: params.id },
    data: { role: body.role },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
  return NextResponse.json(member);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.workspaceMember.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
