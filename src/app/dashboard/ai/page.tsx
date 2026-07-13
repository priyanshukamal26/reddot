'use client';

import { motion } from 'motion/react';
import { Edit, Clock, Droplets, Heart, Shield, MessageSquare, Send, Mic, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  loadAllChats,
  loadChat,
  saveChat,
  createNewChat,
  loadAllEntries,
  loadAllCycles,
  deleteChat,
} from "@/lib/data";
import { calculateCycleStats, getCurrentPhase } from "@/lib/cycle";
import { summarizeRecentData } from "@/lib/summary";
import type { Chat, ChatMessage } from "@/lib/types";

function fallbackTitle(question: string): string {
  let title = question.trim();
  title = title.replace(/^(why|how|what|can|is|are|do|does|am|should)\s+(am|i|you|we|the|a|an|my|your|to|do|have|feel|get)\s+/i, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  title = title.replace(/[?.!,;]/g, '');
  const words = title.split(/\s+/);
  if (words.length > 4) {
    return words.slice(0, 4).join(" ") + "...";
  }
  return title;
}

const StructuredMessage = ({ content = "" }: { content?: string }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: string[] = [];
  let listKey = 0;

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx} className="text-white font-semibold">{part}</strong> : part
    );
  };

  const flushList = (key: number) => {
    if (currentList.length === 0) return null;
    const listItems = currentList.map((item, idx) => (
      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e51d38] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(229,29,56,0.8)]" />
        <span>{renderTextWithBold(item)}</span>
      </li>
    ));
    currentList = [];
    listKey++;
    return (
      <div key={`list-container-${key}-${listKey}`} className="my-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3 shadow-inner">
        <ul className="space-y-3">{listItems}</ul>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentList.length > 0) {
        elements.push(flushList(i));
      }
      continue;
    }

    if (line.startsWith('###')) {
      if (currentList.length > 0) {
        elements.push(flushList(i));
      }
      const headerText = line.replace(/^###\s*/, '');
      elements.push(
        <h3 key={`h3-${i}`} className="text-xs font-mono tracking-widest text-[#e51d38] uppercase font-bold mt-5 mb-2 first:mt-1">
          {headerText}
        </h3>
      );
    } else if (line.startsWith('##')) {
      if (currentList.length > 0) {
        elements.push(flushList(i));
      }
      const headerText = line.replace(/^##\s*/, '');
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm font-mono tracking-widest text-white uppercase font-bold mt-6 mb-3 first:mt-1">
          {headerText}
        </h2>
      );
    } else if (line.startsWith('-') || line.startsWith('*')) {
      const itemText = line.replace(/^[-*]\s*/, '');
      currentList.push(itemText);
    } else {
      if (currentList.length > 0) {
        elements.push(flushList(i));
      }
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 last:mb-0">
          {renderTextWithBold(line)}
        </p>
      );
    }
  }

  if (currentList.length > 0) {
    elements.push(flushList(lines.length));
  }

  return <div className="space-y-1.5">{elements}</div>;
};

export default function ChatPage() {
  const [inputText, setInputText] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [pastChats, setPastChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // Load chat history from IndexedDB on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const chats = await loadAllChats();
        const sorted = [...chats].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPastChats(sorted);

        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');

        if (q) {
          const newThread = createNewChat();
          await saveChat(newThread);
          setCurrentChat(newThread);
          setPastChats([newThread, ...sorted]);
          window.history.replaceState(null, '', window.location.pathname);
          setPendingQuestion(q);
        } else {
          if (sorted.length > 0) {
            const latest = await loadChat(sorted[0].chatId);
            setCurrentChat(latest);
          } else {
            const newThread = createNewChat();
            await saveChat(newThread);
            setCurrentChat(newThread);
            setPastChats([newThread]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingChats(false);
      }
    }
    loadHistory();
  }, []);

  const handleNewChat = useCallback(async () => {
    try {
      const newThread = createNewChat();
      await saveChat(newThread);
      setCurrentChat(newThread);
      setPastChats((prev) => [newThread, ...prev]);
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  }, []);

  const handleSelectChat = useCallback(async (chatId: string) => {
    try {
      const selected = await loadChat(chatId);
      setCurrentChat(selected);
    } catch (err) {
      console.error("Failed to select chat:", err);
    }
  }, []);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteChat(chatId);
      
      const updatedChats = pastChats.filter((c) => c.chatId !== chatId);
      setPastChats(updatedChats);
      
      if (currentChat?.chatId === chatId) {
        if (updatedChats.length > 0) {
          const nextChat = await loadChat(updatedChats[0].chatId);
          setCurrentChat(nextChat);
        } else {
          const newThread = createNewChat();
          await saveChat(newThread);
          setCurrentChat(newThread);
          setPastChats([newThread]);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  }, [currentChat, pastChats]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      let activeChat = currentChat;
      if (!activeChat) {
        activeChat = createNewChat();
        await saveChat(activeChat);
        setPastChats((prev) => [activeChat!, ...prev]);
      }

      const userMsg: ChatMessage = {
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      const updatedChat: Chat = {
        ...activeChat,
        messages: [...activeChat.messages, userMsg],
      };

      setCurrentChat(updatedChat);
      await saveChat(updatedChat);
      setIsLoading(true);

      try {
        const entries = await loadAllEntries();
        const summaryText = summarizeRecentData(entries);

        const cycles = await loadAllCycles();
        let phase = "unknown";
        let dayWithinPhase = 0;
        let confidence = "irregular";

        if (cycles.length > 0) {
          const sorted = [...cycles].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const lastCycleStart = sorted[0].startDate;
          const stats = calculateCycleStats(cycles);
          const currentPhaseInfo = getCurrentPhase(lastCycleStart, stats);

          phase = currentPhaseInfo.phase;
          dayWithinPhase = currentPhaseInfo.dayWithinPhase;
          confidence = currentPhaseInfo.confidence;
        }

        const isFirstMessage = updatedChat.messages.filter(m => m.role === 'user').length === 1;

        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedChat.messages,
            recent_data_summary: summaryText,
            phase,
            dayWithinPhase,
            confidence,
            generate_title: isFirstMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat completion failed");
        }

        const resData = await response.json();
        const assistantText =
          resData.choices?.[0]?.message?.content ||
          "Sorry, I was unable to generate a response at this time.";

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: assistantText,
          timestamp: new Date().toISOString(),
        };

        const newTitle = resData.title || (isFirstMessage ? fallbackTitle(messageText) : undefined);

        const finalChat: Chat = {
          ...updatedChat,
          messages: [...updatedChat.messages, assistantMsg],
          title: newTitle || updatedChat.title || updatedChat.titleHint,
          titleHint: newTitle || updatedChat.titleHint,
        };

        setCurrentChat(finalChat);
        await saveChat(finalChat);

        const refreshedChats = await loadAllChats();
        const sorted = [...refreshedChats].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPastChats(sorted);
      } catch (err) {
        console.error("AI chat error:", err);
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: "System error: I failed to connect to the AI engine. Please verify your connection or try again later.",
          timestamp: new Date().toISOString(),
        };
        const errChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, errorMsg],
        };
        setCurrentChat(errChat);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat]
  );

  // Auto-trigger for handoff query
  useEffect(() => {
    if (pendingQuestion && currentChat && !isLoading) {
      handleSendMessage(pendingQuestion);
      setPendingQuestion(null);
    }
  }, [pendingQuestion, currentChat, isLoading, handleSendMessage]);

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-6 -mb-6">
      {/* Sidebar */}
      <div className="w-64 lg:w-80 border-r border-white/5 bg-[rgba(10,10,10,0.5)] backdrop-blur-sm p-4 flex flex-col h-full shrink-0">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-medium tracking-tight text-white">Chats</h2>
          <button onClick={handleNewChat} className="text-gray-400 hover:text-white transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {pastChats.map((chat) => {
            const active = currentChat?.chatId === chat.chatId;
            return (
              <div
                key={chat.chatId}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all group ${
                  active 
                    ? 'bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                    : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <button
                  onClick={() => handleSelectChat(chat.chatId)}
                  className="flex-1 flex items-start gap-3 overflow-hidden text-left"
                >
                  <div className={`p-2 rounded-full ${active ? 'bg-white/10' : 'bg-transparent'} shrink-0`}>
                    <MessageSquare className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-gray-400'}`}>
                      {chat.title || chat.titleHint || "New Chat"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.chatId);
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e51d38]/5 to-transparent pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 flex flex-col z-10">
          {currentChat?.messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="mr-4 flex-shrink-0 pt-2 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#e51d38] shadow-[0_0_12px_rgba(229,29,56,0.8)]" />
                  <div className="w-[1px] h-full bg-gradient-to-b from-[#e51d38]/30 to-transparent mt-2" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md ${
                  msg.role === 'user'
                    ? 'bg-white/10 border border-white/10 text-white rounded-tr-sm'
                    : 'bg-[#e51d38]/10 border border-[#e51d38]/20 text-gray-200 rounded-tl-sm shadow-[0_4px_20px_rgba(229,29,56,0.05)]'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <StructuredMessage content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full justify-start"
            >
              <div className="mr-4 flex-shrink-0 pt-2 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#e51d38] shadow-[0_0_12px_rgba(229,29,56,0.8)] animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl text-sm bg-[#e51d38]/10 border border-[#e51d38]/20 text-gray-400 rounded-tl-sm">
                Thinking...
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 z-10">
          <div className="max-w-3xl mx-auto relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputText.trim() && !isLoading) {
                  handleSendMessage(inputText);
                  setInputText('');
                }
              }}
              placeholder="Type your message..."
              className="w-full bg-[rgba(20,20,22,0.8)] backdrop-blur-xl border border-white/10 focus:border-[#e51d38]/50 rounded-full py-4 pl-6 pr-24 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-lg"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                onClick={() => {
                  if (inputText.trim() && !isLoading) {
                    handleSendMessage(inputText);
                    setInputText('');
                  }
                }}
                disabled={isLoading}
                className="p-2 text-[#e51d38] hover:text-[#ff4d66] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
