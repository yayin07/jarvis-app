"use client";

import type React from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useAIAssistant } from "@/hooks/use-ai-assistance";

export function AIAssistant() {
  const { processNaturalLanguage, isProcessing } = useAIAssistant();
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/ai/chat",
      onFinish: async (message) => {
        // Process the AI response for task operations
        await processNaturalLanguage(message.content);
      },
    });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isProcessing) return;
    handleSubmit(e);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 mb-4">
        <p className="mb-2">Try saying things like:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            "Add a task to email my boss tomorrow"
          </Badge>
          <Badge variant="secondary">"Delete the task about laundry"</Badge>
          <Badge variant="secondary">
            "Update my grocery list to include bananas"
          </Badge>
          <Badge variant="secondary">"Show me all my urgent tasks"</Badge>
        </div>
      </div>

      <ScrollArea className="h-96 w-full border rounded-lg p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Start a conversation with your AI assistant!</p>
            </div>
          )}

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
                      {isProcessing
                        ? "Processing your request..."
                        : "Thinking..."}
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
          onChange={handleInputChange}
          placeholder="Tell me what you'd like to do with your tasks..."
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
