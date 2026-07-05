"use client";

import { useState, useEffect, useCallback } from "react";
import ChatPageContent from "@/components/ai/ChatPageContent";
import {
  loadAllChats,
  loadChat,
  saveChat,
  createNewChat,
  loadAllEntries,
  loadAllCycles,
} from "@/lib/data";
import { calculateCycleStats, getCurrentPhase } from "@/lib/cycle";
import type { Chat, ChatMessage, DailyEntry, Cycle } from "@/lib/types";

export default function AIChatPage() {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [pastChats, setPastChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  // Load chat history from IndexedDB on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const chats = await loadAllChats();
        // Sort by created_at descending
        const sorted = [...chats].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPastChats(sorted);

        if (sorted.length > 0) {
          // Open latest chat by default
          const latest = await loadChat(sorted[0].chatId);
          setCurrentChat(latest);
        } else {
          // Create an initial empty chat
          const newThread = createNewChat();
          await saveChat(newThread);
          setCurrentChat(newThread);
          setPastChats([newThread]);
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

  // Assemble token-efficient context and send message
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      let activeChat = currentChat;
      if (!activeChat) {
        // Fallback: create a chat if none exists
        activeChat = createNewChat();
        await saveChat(activeChat);
        setPastChats((prev) => [activeChat!, ...prev]);
      }

      // 1. Append user message locally
      const userMsg: ChatMessage = {
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      const updatedChat: Chat = {
        ...activeChat,
        messages: [...activeChat.messages, userMsg],
      };

      // Set state and save locally immediately (optimistic UI)
      setCurrentChat(updatedChat);
      await saveChat(updatedChat);

      setIsLoading(true);

      try {
        // 2. Load and summarize recent cycle data (last 30 days)
        const entries = await loadAllEntries();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEntries = entries.filter(
          (e) => new Date(e.date) >= thirtyDaysAgo
        );

        // Summarize cycle entries token-efficiently
        let loggedDays = recentEntries.length;
        let bleedingDays = 0;
        const symptoms: Record<string, number> = {};
        let moodSum = 0;
        let moodCount = 0;

        recentEntries.forEach((entry) => {
          if (entry.periodFlag) bleedingDays++;
          if (entry.mood !== undefined) {
            moodSum += entry.mood;
            moodCount++;
          }
          if (entry.symptoms) {
            entry.symptoms.forEach((s) => {
              symptoms[s] = (symptoms[s] || 0) + 1;
            });
          }
        });

        const topSymptoms = Object.entries(symptoms)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count]) => `${name} (${count}x)`)
          .join(", ");

        const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : "N/A";

        const summaryText = `Over the past 30 days, the user logged symptoms on ${loggedDays} days. Bleeding/period was logged on ${bleedingDays} days. Key symptoms reported: ${topSymptoms || "None"}. Average mood rating was ${avgMood}/5.`;

        // 3. Load phase parameters
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
          const currentPhase = getCurrentPhase(lastCycleStart, stats);

          phase = currentPhase.phase;
          dayWithinPhase = currentPhase.dayWithinPhase;
          confidence = currentPhase.confidence;
        }

        // 4. Send API request
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedChat.messages, // sends whole conversation thread
            recent_data_summary: summaryText,
            phase,
            dayWithinPhase,
            confidence,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat completion failed");
        }

        const resData = await response.json();
        const assistantText =
          resData.choices?.[0]?.message?.content ||
          "Sorry, I was unable to generate a response at this time.";

        // 5. Append assistant response and save locally
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: assistantText,
          timestamp: new Date().toISOString(),
        };

        const finalChat: Chat = {
          ...updatedChat,
          messages: [...updatedChat.messages, assistantMsg],
        };

        setCurrentChat(finalChat);
        await saveChat(finalChat); // Pushes sync automatically if enabled!

        // Refresh past chats list
        const refreshedChats = await loadAllChats();
        const sorted = [...refreshedChats].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPastChats(sorted);
      } catch (err) {
        console.error("AI chat error:", err);
        // Append error message to chat
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

  if (loadingChats) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-void">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ChatPageContent
      currentChat={currentChat}
      pastChats={pastChats}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
    />
  );
}
