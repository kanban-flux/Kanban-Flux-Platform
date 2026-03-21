import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const workspace = await prisma.workspace.findFirst({
    include: { _count: { select: { boards: true, members: true } } },
  });
  return NextResponse.json(workspace);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data: { name: body.name },
  });
  return NextResponse.json(updated);
}
