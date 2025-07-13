"use client";

import type { Todo } from "@/lib/types";
import { TodoItem } from "./todo-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckSquare } from "lucide-react";
import { LoadingSpinner } from "../common/loading-spinner";

interface TodoListProps {
  todos?: Todo[];
  isLoading: boolean;
  error?: Error | null;
}

export function TodoList({ todos, isLoading, error }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load todos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-slate-600">
          Create your first task or ask the AI assistant to help you get
          started!
        </p>
      </div>
    );
  }

  const urgentTodos = todos.filter(
    (todo) => todo.priority === "HIGH" && !todo.completed
  );
  const regularTodos = todos.filter(
    (todo) => todo.priority !== "HIGH" || todo.completed
  );

  return (
    <div className="space-y-6">
      {urgentTodos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
            🔥 Urgent Tasks
          </h3>
          <div className="space-y-2">
            {urgentTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}

      {regularTodos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-3">
            All Tasks
          </h3>
          <div className="space-y-2">
            {regularTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
