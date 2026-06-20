"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

type MarkdownProps = {
  content: string;
};

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm md:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {

          const codeLines = part.slice(3, -3).trim().split("\n");
          let language = "code";
          let code = part.slice(3, -3).trim();


          const firstLine = codeLines[0].trim();
          if (firstLine && !firstLine.includes(" ") && firstLine.length < 15) {
            language = firstLine;
            code = codeLines.slice(1).join("\n");
          }

          return (
            <CodeBlock key={index} language={language} code={code} />
          );
        } else {

          return <RichTextBlock key={index} text={part} />;
        }
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-200">

      <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 text-xs font-mono text-zinc-400 border-b border-zinc-800">
        <span>{language.toLowerCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors duration-150 focus:outline-none"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto p-4 font-mono text-sm leading-6 scrollbar-none">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}


function parseInlineFormatting(text: string): React.ReactNode[] {

  const regex = /(`[^`\n]+`|\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-secondary text-primary font-mono text-sm border border-border"
        >
          {part.slice(1, -1)}
        </code>
      );
    } else if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={i} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}


function RichTextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: React.ReactNode[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const flushList = (key: number) => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag
        key={`list-${key}`}
        className={`my-3 pl-6 space-y-1.5 ${currentList.type === "ul" ? "list-disc" : "list-decimal"
          }`}
      >
        {currentList.items.map((item, i) => (
          <li key={i} className="text-foreground/95">
            {item}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  const flushTable = (key: number) => {
    if (!currentTable) return;
    elements.push(
      <div key={`table-wrapper-${key}`} className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/70">
            <tr>
              {currentTable.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left font-medium text-muted-foreground"
                >
                  {parseInlineFormatting(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {currentTable.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-secondary/35 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-foreground/90">
                    {parseInlineFormatting(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();


    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList(i);
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());


      if (cells.every((c) => c.startsWith("-") || c.startsWith(":") || c.endsWith(":"))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }


    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (bulletMatch) {
      const content = bulletMatch[3];
      if (!currentList || currentList.type !== "ul") {
        flushList(i);
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(parseInlineFormatting(content));
      continue;
    }


    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const content = numberMatch[3];
      if (!currentList || currentList.type !== "ol") {
        flushList(i);
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(parseInlineFormatting(content));
      continue;
    }


    flushList(i);

    if (trimmed === "") {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
    } else {

      const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = headerMatch[2];
        const HeaderTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

        let headerClass = "";
        if (level === 1) headerClass = "text-2xl font-bold text-foreground mt-4 mb-2";
        else if (level === 2) headerClass = "text-xl font-bold text-foreground mt-3 mb-2";
        else if (level === 3) headerClass = "text-lg font-semibold text-foreground mt-3 mb-1";
        else headerClass = "text-base font-semibold text-foreground mt-2 mb-1";

        elements.push(

          <HeaderTag key={i} className={headerClass}>
            {parseInlineFormatting(headerText)}
          </HeaderTag>
        );
      } else {
        elements.push(
          <p key={i} className="text-foreground/90 font-normal py-0.5">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }
  }

  // Flush remaining blocks
  flushList(lines.length);
  flushTable(lines.length);

  return <>{elements}</>;
}
