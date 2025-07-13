"use client";

import { useState } from "react";
import type { Todo } from "@/lib/types";
import { useTodoMutations } from "@/hooks/use-todo-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Edit2,
  Trash2,
  MoreVertical,
  Calendar,
  Flag,
  X,
} from "lucide-react";
import { format } from "date-fns";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const { updateTodo, deleteTodo, toggleTodo } = useTodoMutations();

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      updateTodo.mutate({
        id: todo.id,
        data: { title: editTitle.trim() },
      });
    }
    setIsEditing(false);
    setEditTitle(todo.title);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
  };

  const handleToggle = () => {
    toggleTodo.mutate(todo.id);
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <Card
      className={`transition-all duration-200 ${
        todo.completed ? "opacity-60 bg-slate-50" : "hover:shadow-md"
      } ${isOverdue ? "border-red-200 bg-red-50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggle}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h4
                className={`font-medium mb-2 ${
                  todo.completed
                    ? "line-through text-slate-500"
                    : "text-slate-900"
                }`}
              >
                {todo.title}
              </h4>
            )}

            {todo.description && (
              <p className="text-sm text-slate-600 mb-2">{todo.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getPriorityColor(todo.priority)}>
                <Flag className="h-3 w-3 mr-1" />
                {todo.priority}
              </Badge>

              {todo.category && (
                <Badge variant="outline">{todo.category}</Badge>
              )}

              {todo.dueDate && (
                <Badge variant={isOverdue ? "destructive" : "secondary"}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(todo.dueDate), "MMM d, yyyy")}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
