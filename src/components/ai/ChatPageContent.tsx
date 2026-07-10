"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import CoreDot from "@/components/layout/CoreDot";
import type { Chat } from "@/lib/types";

// ──────────────────────────────────────────────
// RedDot.ai Chat Screen (#15 from 06_PAGES_AND_FLOWS.md)
//
// Conversational AI interface with:
// - Chat messages (user + assistant)
// - Past-chats sidebar/list for resume (E5)
// - Report analysis mode tab
// - Persistent "informational, not medical advice" label
// ──────────────────────────────────────────────

interface ChatPageContentProps {
  currentChat: Chat | null;
  pastChats: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatPageContent({
  currentChat,
  pastChats,
  onNewChat,
  onSelectChat,
  onSendMessage,
  isLoading = false,
}: ChatPageContentProps) {
  const [input, setInput] = useState("");
  const [showPastChats, setShowPastChats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages.length, isLoading]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
    inputRef.current?.focus();
  }, [input, isLoading, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-void-950">
      {/* ── Past chats sidebar (mobile: slide-over; desktop: persistent) ── */}
      <aside
        className={`
          ${showPastChats ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          fixed md:relative z-30 md:z-auto
          w-64 h-full bg-void-950 border-r border-void-border
          transition-transform duration-200
          flex flex-col flex-shrink-0
        `}
      >
        <div className="p-4 border-b border-void-border">
          <button
            onClick={onNewChat}
            className="w-full py-2.5 border border-void-border bg-void-900 rounded-md text-xs font-mono font-medium uppercase tracking-widest text-paper hover:bg-void-800 hover:border-signal-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-signal-500" />
            <span>New chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {pastChats.map((chat) => (
            <button
              key={chat.chatId}
              onClick={() => {
                onSelectChat(chat.chatId);
                setShowPastChats(false);
              }}
              className={`
                w-full text-left px-4 py-2.5 transition-colors border-l-2 rounded-r-md
                ${currentChat?.chatId === chat.chatId
                  ? "border-signal-500 bg-void-900 text-paper"
                  : "border-transparent text-fog hover:text-paper hover:bg-void-800/40"
                }
              `}
            >
              <div className="truncate text-xs font-medium">{chat.titleHint}</div>
              <div className="text-[9px] text-ink-500 font-mono mt-1 tracking-wider">
                {new Date(chat.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }).toUpperCase()}
              </div>
            </button>
          ))}
          {pastChats.length === 0 && (
            <p className="text-[10px] text-ink-500 font-mono tracking-widest text-center py-8">
              NO PAST CONVERSATIONS
            </p>
          )}
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {showPastChats && (
        <div
          className="fixed inset-0 bg-void/60 z-20 md:hidden"
          onClick={() => setShowPastChats(false)}
        />
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-void-950">
        {/* Chat header (Mockup style) */}
        <div className="bg-void-900 px-4 py-3.5 border-b border-void-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setShowPastChats(!showPastChats)}
              className="md:hidden text-fog hover:text-paper text-sm"
              aria-label="Toggle chat history"
            >
              ☰
            </button>
            {/* Mockup browser dots */}
            <div className="hidden sm:flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-ink-500/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-paper-50/20" />
            </div>
          </div>
          
          <div className="text-[10px] font-mono text-ink-500 tracking-wider font-bold">
            REDDOT.AI ASSISTANT
          </div>

          <div className="flex items-center gap-3">
            {/* Chat/Reports Navigation tab inside header */}
            <div className="flex bg-void p-0.5 rounded border border-void-border text-[9px] font-mono uppercase tracking-wider">
              <span className="px-2.5 py-0.5 text-paper bg-signal-500/10 border border-signal-500/20 rounded font-bold">
                Chat
              </span>
              <Link
                href="/dashboard/report"
                className="px-2.5 py-0.5 text-fog hover:text-paper rounded transition-colors"
              >
                Reports
              </Link>
            </div>
            
            <span className="text-[9px] font-mono text-signal-500 px-2 py-0.5 rounded bg-signal-500/10 border border-signal-500/20 font-bold">
              Secure Socket
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {(!currentChat || currentChat.messages.length === 0) && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-12 h-12 rounded-full border border-void-border flex items-center justify-center mx-auto text-signal-500">
                  💬
                </div>
                <h3 className="text-base font-bold font-display text-paper">
                  Ask RedDot.ai
                </h3>
                <p className="text-xs text-fog leading-relaxed">
                  Ask about your cycle, symptoms, or patterns. The engine will reference
                  your decrypted local data to answer questions privately.
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {["Why am I tired this week?", "What phase am I in?", "Any patterns in my symptoms?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 bg-void-900 border border-void-border text-fog text-xs rounded hover:text-paper hover:border-signal-500/50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentChat?.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="space-y-1 text-right flex flex-col items-end max-w-[80%]">
                  <span className="text-[8px] font-mono text-ink-500 uppercase tracking-wider mr-1">You</span>
                  <div className="bg-signal-500/10 text-paper border border-signal-500/20 rounded-xl p-3.5 text-left text-xs sm:text-sm leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 flex flex-col items-start max-w-[80%]">
                  <div className="flex items-center gap-1.5 mb-0.5 ml-1">
                    <CoreDot className="w-1.5 h-1.5" />
                    <span className="text-[8px] font-mono text-signal-500 uppercase tracking-widest font-bold">
                      RedDot.ai
                    </span>
                  </div>
                  <div className="bg-void-900 border border-void-border text-paper/90 rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="space-y-1 flex flex-col items-start">
                <div className="flex items-center gap-1.5 ml-1">
                  <CoreDot pulse={true} className="w-1.5 h-1.5" />
                  <span className="text-[8px] font-mono text-signal-500 uppercase tracking-widest font-bold animate-pulse">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Persistent informational disclaimer ── */}
        <div className="px-6 pb-2 text-center select-none">
          <p className="text-[9px] font-mono text-ink-500 uppercase tracking-widest">
            🔒 Informational only — not medical advice. Always consult a healthcare provider.
          </p>
        </div>

        {/* Input */}
        <div className="px-6 pb-6">
          <div className="flex gap-2 bg-void-900 rounded-xl border border-void-border focus-within:border-signal-500 transition-colors p-1.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask RedDot.ai..."
              rows={1}
              className="flex-1 bg-transparent text-paper text-sm px-4 py-3 resize-none focus:outline-none placeholder:text-fog/30"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-signal-500 hover:text-signal-600 hover:bg-void-800 transition-all disabled:opacity-30 flex-shrink-0"
              aria-label="Send message"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
