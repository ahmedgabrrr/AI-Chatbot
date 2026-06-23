"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, Bot, SendHorizontal, Sparkles, Trash2 } from "lucide-react";
import Sidebar, { ChatSession } from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import SuggestedPrompts from "@/components/SuggestedPrompts";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("gaboorachat_sessions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        } else {
          createNewSession();
        }
      } catch (err) {
        console.error("Failed to parse sessions", err);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("gaboorachat_sessions", JSON.stringify(sessions));
    }
  }, [sessions, isMounted]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [sessions, activeSessionId, loading]);

  const createNewSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 9) + Date.now();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);

    if (activeSessionId === id) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        const newSessionId = Math.random().toString(36).substring(2, 9) + Date.now();
        const newSession: ChatSession = {
          id: newSessionId,
          title: "New Chat",
          messages: [],
          createdAt: Date.now(),
        };
        setSessions([newSession]);
        setActiveSessionId(newSessionId);
      }
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading || !activeSessionId) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: time,
    };

    const updatedMessages = [...activeMessages, userMsg];

    let newTitle = activeSession?.title || "New Chat";
    if (newTitle === "New Chat") {
      newTitle = textToSend.slice(0, 30);
      if (textToSend.length > 30) newTitle += "...";
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: newTitle, messages: updatedMessages }
          : s
      )
    );

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages
            .filter(({ content }) => content && content.trim() !== "")
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        let errorMessage = "Sorry, I encountered an issue generating a response. Please check your network and try again.";
        try {
          const errorData = await res.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (_) { }
        throw new Error(errorMessage);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("Response stream is not readable.");
      }

      const aiTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newAiMsg: Message = {
        role: "assistant",
        content: "",
        timestamp: aiTime,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, newAiMsg] }
            : s
        )
      );

      setLoading(false);

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        console.log(accumulatedText)
        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId
              ? {
                ...s,
                messages: s.messages.map((msg, idx) =>
                  idx === s.messages.length - 1 && msg.role === "assistant"
                    ? { ...msg, content: accumulatedText }
                    : msg
                ),
              }
              : s
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      const aiTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const errorMsg: Message = {
        role: "assistant",
        content: err?.message || "Sorry, I encountered an issue generating a response. Please check your network and try again.",
        timestamp: aiTime,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const msgs = s.messages;
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === "assistant" && lastMsg.content === "") {
            return {
              ...s,
              messages: msgs.map((msg, idx) =>
                idx === msgs.length - 1 ? errorMsg : msg
              ),
            };
          } else {
            return { ...s, messages: [...updatedMessages, errorMsg] };
          }
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  const clearActiveChat = () => {
    if (!activeSessionId) return;
    if (confirm("Are you sure you want to clear this conversation's messages?")) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
      );
    }
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <Bot className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full min-w-0 bg-background relative">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 h-16 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 md:hidden text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <h1 className="font-semibold text-sm md:text-base text-foreground tracking-tight max-w-[150px] md:max-w-xs truncate">
                {activeSession?.title || "Chat"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-semibold text-foreground/80">
              <Bot className="w-3.5 h-3.5 text-primary" />

            </div>

            {activeMessages.length > 0 && (
              <button
                onClick={clearActiveChat}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                title="Clear current messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
          {activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 max-w-2xl mx-auto space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
                <Bot className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Welcome to GaBooRa AI
                </h2>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  A professional artificial intelligence interface. Select a quick starter below or type a message to start conversing.
                </p>
              </div>

              <div className="w-full pt-4">
                <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-2">
              {activeMessages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}

              {loading && (
                <MessageBubble
                  message={{ role: "assistant", content: "" }}
                  isLoading={true}
                />
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-border/80 bg-gradient-to-t from-background via-background to-background/50">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-lg shadow-black/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                placeholder="Message GaBooRa AI..."
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 max-h-48 resize-none bg-transparent py-3 px-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none scrollbar-none h-[42px]"
                disabled={loading}
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:hover:opacity-30 transition-all shadow-md shadow-primary/25 shrink-0 active:scale-[0.96]"
                title="Send message"
              >
                <SendHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/60 mt-2.5">
              GaBooRa AI can make mistakes. developed by &copy; <Link href="https://wa.me/201064907076" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ahmed Gabr</Link> 2026.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}