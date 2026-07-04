"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Chat, ChatMessage } from "@/lib/types";

// ──────────────────────────────────────────────
// RedDot.ai Chat Screen (#15 from 06_PAGES_AND_FLOWS.md)
//
// Conversational AI interface with:
// - Chat messages (user + assistant)
// - Past-chats sidebar/list for resume (E5)
// - Report analysis mode tab
// - Persistent "informational, not medical advice" label
//
// Per 08_AI_PROMPTS_AND_LOGIC.md:
// - Uses exact system prompts (shared safety preamble + E1 prompt)
// - Context: last ~30 days of decrypted data + current conversation thread
// - Client writes exchanges to encrypted IndexedDB after response
// - Server remains stateless per-request
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
  }, [currentChat?.messages.length]);

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
    <div className="flex h-[calc(100vh-64px)]">
      {/* ── Past chats sidebar (mobile: slide-over; desktop: persistent) ── */}
      <aside
        className={`
          ${showPastChats ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          fixed md:relative z-30 md:z-auto
          w-64 h-full bg-ash border-r border-fog/5
          transition-transform duration-200
          flex flex-col
        `}
      >
        <div className="p-3 border-b border-fog/5">
          <button
            onClick={onNewChat}
            className="w-full py-2 rounded-md bg-signal text-paper text-sm font-medium hover:bg-signal-deep transition-colors"
          >
            + New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pastChats.map((chat) => (
            <button
              key={chat.chatId}
              onClick={() => {
                onSelectChat(chat.chatId);
                setShowPastChats(false);
              }}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${currentChat?.chatId === chat.chatId
                  ? "bg-signal/10 text-paper"
                  : "text-fog hover:text-paper hover:bg-void"
                }
              `}
            >
              <div className="truncate">{chat.titleHint}</div>
              <div className="text-[10px] text-fog/50 font-mono mt-0.5">
                {new Date(chat.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </button>
          ))}
          {pastChats.length === 0 && (
            <p className="text-xs text-fog/50 text-center py-4">
              No past conversations
            </p>
          )}
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {showPastChats && (
        <div
          className="fixed inset-0 bg-void/50 z-20 md:hidden"
          onClick={() => setShowPastChats(false)}
        />
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-fog/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPastChats(!showPastChats)}
              className="md:hidden text-fog hover:text-paper text-sm"
            >
              ☰
            </button>
            <h2 className="text-sm font-medium text-paper">
              Red<span className="text-signal">Dot</span>.ai
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium text-paper bg-signal/10 rounded-md">
              Chat
            </button>
            <a
              href="/dashboard/report"
              className="px-3 py-1 text-xs font-medium text-fog hover:text-paper rounded-md transition-colors"
            >
              Reports
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {(!currentChat || currentChat.messages.length === 0) && (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center space-y-3 max-w-sm">
                <div className="text-4xl">💬</div>
                <h3 className="text-lg font-medium text-paper">
                  Ask Red<span className="text-signal">Dot</span>.ai
                </h3>
                <p className="text-sm text-fog">
                  Ask about your cycle, symptoms, or patterns. I&apos;ll reference
                  your actual logged data to give specific answers.
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {["Why am I tired this week?", "What phase am I in?", "Any patterns in my symptoms?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 bg-ash text-fog text-xs rounded-md hover:text-paper transition-colors"
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
              <div
                className={`
                  max-w-[80%] rounded-md px-4 py-3 text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-signal/10 text-paper"
                    : "bg-ash text-paper/90"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-ash rounded-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-signal/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-signal/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-signal/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Persistent informational disclaimer (per 08_AI_PROMPTS_AND_LOGIC.md) ── */}
        <div className="px-4 pb-1">
          <p className="text-[10px] text-fog/40 text-center">
            Informational only — not medical advice. Always consult a healthcare provider.
          </p>
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 bg-ash rounded-md border border-fog/10 focus-within:border-signal transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask RedDot.ai..."
              rows={1}
              className="flex-1 bg-transparent text-paper text-sm px-4 py-3 resize-none focus:outline-none placeholder:text-fog/40"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 text-signal hover:text-signal-deep transition-colors disabled:opacity-30"
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
