"use client";

import React, { useState } from "react";
import { MessageSquare, Plus, Trash2, Edit3, Check, X, Menu, Bot } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export type ChatSession = {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
};

type SidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onClose,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  return (
    <>

      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}


      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >

        <div className="flex items-center justify-between p-4 border-b border-sidebar-border h-16">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-foreground tracking-tight text-base">GaBooRa AI</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 md:hidden text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>


        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none pb-4">
          <p className="text-[11px] font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
            History
          </p>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground/60 italic">
              No conversations yet
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = session.id === editingId;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between w-full p-3 rounded-xl cursor-pointer text-sm transition-all duration-200 ${isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(e as any, session.id);
                          if (e.key === "Escape") handleCancelRename(e as any);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-background border border-primary/50 text-foreground rounded px-1.5 py-0.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate text-xs md:text-sm">{session.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-1">
                      <button
                        onClick={(e) => startEditing(e, session.id, session.title)}
                        className="p-1 hover:text-primary rounded hover:bg-background transition-colors"
                        title="Rename"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        className="p-1 hover:text-destructive rounded hover:bg-background transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                      <button
                        onClick={(e) => handleSaveRename(e, session.id)}
                        className="p-1 text-emerald-500 hover:bg-background rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleCancelRename(e)}
                        className="p-1 text-destructive hover:bg-background rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border flex items-center justify-between bg-sidebar/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-primary">
              AG
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">Ahmed M Gabr</p>
              <p className="text-[10px] text-muted-foreground">User Session</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
