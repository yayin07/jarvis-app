"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Todo, CreateTodoData, UpdateTodoData } from "@/lib/types"
import { toast } from "sonner"

async function createTodo(data: CreateTodoData): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create todo")
  return response.json()
}

async function updateTodo({ id, data }: { id: string; data: UpdateTodoData }): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update todo")
  return response.json()
}

async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete todo")
}

async function toggleTodo(id: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}/toggle`, {
    method: "PATCH",
  })
  if (!response.ok) throw new Error("Failed to toggle todo")
  return response.json()
}



export function useTodoMutations() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] })
      toast.success("Task created successfully!")
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message)
    },
  })

  const updateTodoMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] })
      toast.success("Task updated successfully!")
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message)
    },
  })

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] })
      toast.success("Task deleted successfully!")
    },
    onError: (error) => {
      toast.error("Failed to delete task: " + error.message)
    },
  })

  const toggleTodoMutation = useMutation({
    mutationFn: toggleTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] })
    },
    onError: (error) => {
      toast.error("Failed to toggle task: " + error.message)
    },
  })

  return {
    createTodo: createTodoMutation,
    updateTodo: updateTodoMutation,
    deleteTodo: deleteTodoMutation,
    toggleTodo: toggleTodoMutation,
  }
}
