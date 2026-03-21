import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const labels = await prisma.label.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(labels);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, color } = body;
  if (!name || !color) {
    return NextResponse.json(
      { error: "name and color are required" },
      { status: 400 }
    );
  }
  const label = await prisma.label.create({
    data: { name, color },
  });
  return NextResponse.json(label, { status: 201 });
}
