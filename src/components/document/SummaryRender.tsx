import type { ReactNode } from "react";

export interface SummaryContent {
  markdown: string;
}

export function SummaryRender({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const out: ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc list-outside pl-6 my-4 space-y-2 text-[#cccccc] leading-[1.8]">
          {listBuffer.map((it, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushList();
      out.push(
        <h2
          key={i}
          className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#e8e8e8] mt-10 mb-4 pb-2 border-b border-[#222]"
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      out.push(
        <h3 key={i} className="font-display text-xl font-semibold text-[#e8e8e8] mt-8 mb-3">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("> ")) {
      flushList();
      out.push(
        <blockquote
          key={i}
          className="border-l-2 border-orange pl-4 py-3 italic text-[#999] my-5 font-display text-lg bg-[#111] rounded-r"
          dangerouslySetInnerHTML={{ __html: inline(line.slice(2)) }}
        />,
      );
    } else if (/^[-*] /.test(line)) {
      listBuffer.push(line.slice(2));
    } else if (line === "") {
      flushList();
    } else {
      flushList();
      out.push(
        <p
          key={i}
          className="text-base leading-[1.8] text-[#cccccc] my-4"
          dangerouslySetInnerHTML={{ __html: inline(line) }}
        />,
      );
    }
  });
  flushList();
  return <>{out}</>;
}

function inline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e8e8e8] font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}
