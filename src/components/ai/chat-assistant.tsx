"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useAIAssistant } from "@/hooks/use-ai-assistance";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatAssistant() {
  const { processNaturalLanguage, isProcessing } = useAIAssistant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || isProcessing) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await res.json();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply ?? "🤖 Here's what I found.",
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (data?.rawAIResponse) {
        await processNaturalLanguage(data.rawAIResponse);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "❌ Something went wrong.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-96 w-full border rounded-lg p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`${
                message.role === "user" ? "ml-8 bg-blue-50" : "mr-8 bg-slate-50"
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  ) : (
                    <Bot className="h-5 w-5 text-slate-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(isLoading || isProcessing) && (
            <Card className="mr-8 bg-slate-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-slate-600" />
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-slate-600">
                      {isProcessing ? "Processing your task..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me what you'd like to do..."
          disabled={isLoading || isProcessing}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading || isProcessing}
          size="icon"
        >
          {isLoading || isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
