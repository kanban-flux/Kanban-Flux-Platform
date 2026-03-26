import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const buffer = await req.arrayBuffer();
  const { extractTextFromPDF } = await import("@/lib/pdf-parser");
  const text = await extractTextFromPDF(buffer);
  return NextResponse.json({ text });
}
