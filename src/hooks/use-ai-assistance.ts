"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";

interface AITaskOperation {
  operation: "create" | "update" | "delete" | "query";
  data?: any;
  taskId?: string;
}

async function processAIRequest(message: string): Promise<AITaskOperation[]> {
  const response = await fetch("/api/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) throw new Error("Failed to process AI request");

  return response.json();
}

export function useAIAssistant() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const processNaturalLanguage = async (message: string) => {
    setIsProcessing(true);
    try {
      const operations = await processAIRequest(message);

      console.log("🔍 AI operations:", operations); // optional debug

      for (const operation of operations) {
        switch (operation.operation) {
          case "create":
            if (!operation.data?.text && !operation.data?.title) continue;

            const todoData = {
              title: operation.data.title || operation.data.text || "Untitled task",
              description: operation.data.description ?? "",
              priority: operation.data.priority ?? "MEDIUM",
              category: operation.data.category ?? "",
              dueDate: operation.data.dueDate ?? null,
              completed: operation.data?.completed ?? false,
            };

            await fetch("/api/todos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(todoData),
            });
            break;

          case "update":
            if (!operation.taskId || !operation.data) continue;

            await fetch(`/api/todos/${operation.taskId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(operation.data),
            });
            break;

          case "delete":
            if (!operation.taskId) continue;

            await fetch(`/api/todos/${operation.taskId}`, {
              method: "DELETE",
            });
            break;

          case "query":
            console.log("ℹ️ Query operation received. Not implemented yet.");
            break;

          default:
            console.warn("⚠️ Unsupported AI operation:", operation.operation);
        }
      }

      // ✅ Refresh UI
      await queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });

      if (operations.length > 0) {
        toast.success("AI assistant completed your request!");
      }
    } catch (error) {
      console.error("❌ AI processing error:", error);
      toast.error("Failed to process your request");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processNaturalLanguage,
    isProcessing,
  };
}
