"use client";
import { useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, CheckSquare, Plus } from "lucide-react";
import { Header } from "../common/header";
import { useAIAssistant } from "@/hooks/use-ai-assistance";
import { TodoForm } from "../todos/todo-form";
import { TodoList } from "../todos/todo-list";

export function TodoDashboard() {
  const [activeTab, setActiveTab] = useState("todos");
  const { todos, isLoading, error } = useTodos();
  const { isProcessing } = useAIAssistant();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            AI-Powered Todo Manager
          </h1>
          <p className="text-slate-600">
            Manage your tasks traditionally or chat with your AI assistant
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks ({todos?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Assistant
              {isProcessing && (
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <TodoList todos={todos} isLoading={isLoading} error={error} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <TodoForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <AIAssistant />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
