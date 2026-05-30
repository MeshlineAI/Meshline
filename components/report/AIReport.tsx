"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AIReport({ markdown }: { markdown: string }) {
  if (!markdown?.trim()) {
    return <p className="text-sm text-muted">No written report was generated for this scan.</p>;
  }
  return (
    <div className="prose-mesh max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
