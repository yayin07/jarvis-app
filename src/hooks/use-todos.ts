"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Todo } from "@/lib/types"

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos")
  if (!response.ok) {
    throw new Error("Failed to fetch todos")
  }
  return response.json()
}

export function useTodos() {
  const { user } = useAuthStore()

  const query = useQuery({
    queryKey: ["todos", user?.id],
    queryFn: fetchTodos,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    todos: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
