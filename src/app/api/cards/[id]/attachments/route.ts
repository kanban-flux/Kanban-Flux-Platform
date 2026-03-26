import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const attachmentId = searchParams.get("attachmentId");
  const full = searchParams.get("full");

  // If requesting a specific attachment with full content
  if (attachmentId && full) {
    const attachment = await prisma.cardAttachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }
    return NextResponse.json(attachment);
  }

  const attachments = await prisma.cardAttachment.findMany({
    where: { cardId: params.id },
    select: {
      id: true,
      filename: true,
      fileType: true,
      mimeType: true,
      size: true,
      createdBy: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(attachments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { filename, content, mimeType, fileType } = body as {
    filename: string;
    content: string;
    mimeType?: string;
    fileType?: string;
  };

  if (!filename || !content) {
    return NextResponse.json(
      { error: "filename and content are required" },
      { status: 400 }
    );
  }

  // Determine file type and mime type from extension
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mimeTypes: Record<string, string> = {
    ts: "text/typescript",
    tsx: "text/typescript",
    js: "text/javascript",
    jsx: "text/javascript",
    py: "text/x-python",
    md: "text/markdown",
    txt: "text/plain",
    json: "application/json",
    yaml: "text/yaml",
    yml: "text/yaml",
    html: "text/html",
    css: "text/css",
    prisma: "text/plain",
    sql: "text/sql",
    sh: "text/x-shellscript",
    rs: "text/x-rust",
    go: "text/x-go",
    java: "text/x-java",
    rb: "text/x-ruby",
    php: "text/x-php",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };

  const codeExtensions = new Set([
    "ts", "tsx", "js", "jsx", "py", "json", "yaml", "yml", "html",
    "css", "prisma", "sql", "sh", "rs", "go", "java", "rb", "php",
  ]);
  const imageExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);

  const resolvedMimeType = mimeType || mimeTypes[ext] || "text/plain";
  let resolvedFileType = fileType || "document";
  if (!fileType) {
    if (codeExtensions.has(ext)) resolvedFileType = "code";
    else if (imageExtensions.has(ext)) resolvedFileType = "image";
    else if (ext === "md" || ext === "txt") resolvedFileType = "document";
  }

  // Get the first non-agent user as creator (since we don't have auth yet)
  const user = await prisma.user.findFirst({ where: { isAgent: false } });
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 400 });
  }

  const attachment = await prisma.cardAttachment.create({
    data: {
      cardId: params.id,
      filename,
      fileType: resolvedFileType,
      mimeType: resolvedMimeType,
      content,
      size: Buffer.byteLength(content, "utf8"),
      createdBy: user.id,
    },
  });

  return NextResponse.json(attachment);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const attachmentId = searchParams.get("attachmentId");

  if (!attachmentId) {
    return NextResponse.json(
      { error: "attachmentId query param required" },
      { status: 400 }
    );
  }

  await prisma.cardAttachment.delete({ where: { id: attachmentId } });
  return NextResponse.json({ success: true });
}
