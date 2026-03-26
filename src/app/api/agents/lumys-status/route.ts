import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lumysUrl = process.env.LUMYS_URL || "http://localhost:4200";
    const res = await fetch(`${lumysUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
    return NextResponse.json({ available: res.ok, url: lumysUrl });
  } catch {
    return NextResponse.json({ available: false });
  }
}
