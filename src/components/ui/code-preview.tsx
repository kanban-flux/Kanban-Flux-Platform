"use client";

interface CodePreviewProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodePreview({ code, language, filename }: CodePreviewProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {filename && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-xs font-mono text-secondary">
          <span>{filename}</span>
          {language && <span className="text-xs text-secondary/60">({language})</span>}
        </div>
      )}
      <pre className="p-3 bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
