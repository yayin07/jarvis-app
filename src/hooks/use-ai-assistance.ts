"use client"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

interface AITaskOperation {
  operation: "create" | "update" | "delete" | "query"
  data?: any
  taskId?: string
}

async function processAIRequest(message: string): Promise<AITaskOperation[]> {
  const response = await fetch("/api/ai/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  if (!response.ok) throw new Error("Failed to process AI request")
  return response.json()
}

export function useAIAssistant() {
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const processNaturalLanguage = async (message: string) => {
    setIsProcessing(true)
    try {
      const operations = await processAIRequest(message)

      for (const operation of operations) {
        switch (operation.operation) {
          case "create":
            await fetch("/api/todos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(operation.data),
            })
            break
          case "update":
            await fetch(`/api/todos/${operation.taskId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(operation.data),
            })
            break
          case "delete":
            await fetch(`/api/todos/${operation.taskId}`, {
              method: "DELETE",
            })
            break
        }
      }

      // Refresh todos after AI operations
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] })

      if (operations.length > 0) {
        toast.success("AI assistant completed your request!")
      }
    } catch (error) {
      console.error("AI processing error:", error)
      toast.error("Failed to process your request")
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processNaturalLanguage,
    isProcessing,
  }
}
