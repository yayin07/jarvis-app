"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTodoMutations } from "./use-todo-mutations";
import type { CreateTodoData } from "@/lib/types";

export function useAIAssistant() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { createTodo: createTodoMutation } = useTodoMutations();

  const processNaturalLanguage = async (rawAIResponse: any[]) => {
    if (!Array.isArray(rawAIResponse) || rawAIResponse.length === 0) return;

    setIsProcessing(true);
    try {
      const todo = rawAIResponse[0];

      const todoData: CreateTodoData = {
        title: todo.title ?? "Untitled Task",
        description: todo.description ?? "",
        priority: ["LOW", "MEDIUM", "HIGH"].includes(todo.priority)
          ? todo.priority
          : "MEDIUM",
        category: todo.category ?? "",
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : undefined,
      };

      await createTodoMutation.mutateAsync(todoData);
      toast.success("✅ AI created your task!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch (error) {
      console.error("❌ Todo creation failed:", error);
      toast.error("❌ Failed to create todo from AI response.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processNaturalLanguage,
    isProcessing,
  };
}