"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, Bot } from "lucide-react";
import Markdown from "./Markdown";
import avatarImg from "@/public/avat.png";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

type MessageBubbleProps = {
  message: Message;
  isLoading?: boolean;
};

export default function MessageBubble({ message, isLoading = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message: ", err);
    }
  };

  return (
    <div
      className={`flex gap-3 md:gap-4 w-full animate-fade-in-up py-4 px-2 md:px-4 rounded-2xl transition-all ${isUser
        ? "flex-row-reverse"
        : "bg-secondary/20 hover:bg-secondary/35 border border-border/20"
        }`}
    >

      <div className="shrink-0">
        {isUser ? (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-sm text-indigo-700 dark:text-indigo-300 shadow-sm">
            U
          </div>
        ) : (
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <Image
              src={avatarImg}
              alt="GaBooRa AI"
              className="w-full h-full object-cover"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P9vPQAJdgN2zJ9iEQAAAABJRU5ErkJggg=="
            />
          </div>
        )}
      </div>


      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] gap-1.5 ${isUser ? "items-end" : "items-start"}`}>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground/80">
            {isUser ? "You" : "GaBooRa AI"}
          </span>
          {message.timestamp && (
            <span className="text-[10px] text-muted-foreground font-normal">
              {message.timestamp}
            </span>
          )}
        </div>


        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm ${isUser
            ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-tr-none"
            : "bg-card text-foreground border border-border rounded-tl-none w-full"
            }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-1 py-1.5 px-1">
              <span className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full typing-dot" />
              <span className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full typing-dot" />
              <span className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full typing-dot" />
            </div>
          ) : isUser ? (
            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>


        {!isUser && !isLoading && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary/60 transition-all duration-150 focus:outline-none"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
