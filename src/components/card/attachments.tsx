"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileCode,
  FileText,
  Image as ImageIcon,
  GitBranch,
  Paperclip,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { CodePreview } from "@/components/ui/code-preview";

interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  mimeType: string;
  size: number;
  createdBy: string;
  createdAt: string;
  content?: string;
  user?: { id: string; name: string; avatar: string | null };
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "code":
      return FileCode;
    case "document":
      return FileText;
    case "image":
      return ImageIcon;
    case "diagram":
      return GitBranch;
    default:
      return FileText;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getLanguageFromFilename(filename: string): string | undefined {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript (JSX)",
    js: "JavaScript",
    jsx: "JavaScript (JSX)",
    py: "Python",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    html: "HTML",
    css: "CSS",
    prisma: "Prisma",
    sql: "SQL",
    sh: "Shell",
    rs: "Rust",
    go: "Go",
    java: "Java",
    rb: "Ruby",
    php: "PHP",
    md: "Markdown",
  };
  return map[ext];
}

function AttachmentItem({
  attachment,
  cardId,
  onDelete,
}: {
  attachment: Attachment;
  cardId: string;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const Icon = getFileIcon(attachment.fileType);

  async function loadContent() {
    if (content !== null) {
      setExpanded(!expanded);
      return;
    }
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/attachments`);
      const attachments: Attachment[] = await res.json();
      const full = attachments.find(
        (a: Attachment) => a.id === attachment.id
      );
      // The list endpoint doesn't include content, fetch the full content directly
      const contentRes = await fetch(
        `/api/cards/${cardId}/attachments?attachmentId=${attachment.id}&full=true`
      );
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContent(data.content || full?.content || "");
      } else {
        setContent("[Could not load content]");
      }
    } catch {
      setContent("[Error loading content]");
    } finally {
      setLoadingContent(false);
      setExpanded(true);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(
      `/api/cards/${cardId}/attachments?attachmentId=${attachment.id}`,
      { method: "DELETE" }
    );
    onDelete();
  }

  const language = getLanguageFromFilename(attachment.filename);
  const isMarkdown =
    attachment.filename.endsWith(".md") ||
    attachment.filename.endsWith(".mdx");
  const isCode = attachment.fileType === "code";
  const isImage = attachment.fileType === "image";

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer group"
        onClick={loadContent}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-secondary shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-secondary shrink-0" />
        )}
        <Icon className="h-4 w-4 text-secondary shrink-0" />
        <span className="text-sm font-mono text-neutral-900 truncate flex-1">
          {attachment.filename}
        </span>
        <span className="text-xs text-secondary shrink-0">
          {formatFileSize(attachment.size)}
        </span>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
        >
          <Trash2 className="h-3.5 w-3.5 text-danger" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-200">
          {loadingContent ? (
            <div className="p-4 text-center text-xs text-secondary">
              Loading...
            </div>
          ) : content !== null ? (
            <div className="max-h-[400px] overflow-y-auto">
              {isMarkdown ? (
                <div className="p-3">
                  <Markdown content={content} />
                </div>
              ) : isCode ? (
                <CodePreview
                  code={content}
                  language={language}
                  filename={attachment.filename}
                />
              ) : isImage ? (
                <div className="p-3 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content}
                    alt={attachment.filename}
                    className="max-w-full max-h-[300px] rounded"
                  />
                </div>
              ) : (
                <pre className="p-3 text-xs font-mono text-neutral-700 whitespace-pre-wrap">
                  {content}
                </pre>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AttachmentsSection({
  cardId,
  onUpdate,
}: {
  cardId: string;
  onUpdate?: () => void;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/api/cards/${cardId}/attachments`);
      const data = await res.json();
      setAttachments(data);
    } catch {
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let content: string;
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        // Convert to base64 data URL
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        content = `data:${file.type};base64,${base64}`;
      } else {
        content = await file.text();
      }

      await fetch(`/api/cards/${cardId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          content,
          mimeType: file.type || undefined,
          fileType: isImage ? "image" : undefined,
        }),
      });

      fetchAttachments();
      onUpdate?.();
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDelete() {
    fetchAttachments();
    onUpdate?.();
  }

  if (loading) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
          <Paperclip className="h-4 w-4 text-secondary" />
          Attachments
          {attachments.length > 0 && (
            <span className="text-xs font-normal text-secondary">
              ({attachments.length})
            </span>
          )}
        </h4>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".ts,.tsx,.js,.jsx,.py,.json,.yaml,.yml,.html,.css,.prisma,.sql,.sh,.rs,.go,.java,.rb,.php,.md,.txt,.svg,.png,.jpg,.jpeg,.gif,.webp"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Attach file
              </>
            )}
          </Button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-secondary italic">No attachments yet</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              cardId={cardId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
