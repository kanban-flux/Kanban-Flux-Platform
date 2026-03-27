import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const { masterOrchestratorScan } = await import("@/lib/agents/master-scan");
  const result = await masterOrchestratorScan();
  return NextResponse.json(result);
}

export async function GET() {
  const { masterOrchestratorScan } = await import("@/lib/agents/master-scan");
  const result = await masterOrchestratorScan();
  return NextResponse.json(result);
}
