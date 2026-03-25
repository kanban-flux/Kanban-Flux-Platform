import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const { generateReport } = await import("@/lib/intelligence/report-agent");
  const report = await generateReport(projectId);
  return NextResponse.json(report);
}
