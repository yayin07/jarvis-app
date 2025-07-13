export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "LOW" | "MEDIUM" | "HIGH"
  category?: string
  dueDate?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTodoData {
  title: string
  description?: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  category?: string
  dueDate?: string
}

export interface UpdateTodoData {
  title?: string
  description?: string
  priority?: "LOW" | "MEDIUM" | "HIGH"
  category?: string
  dueDate?: string
  completed?: boolean
}

export interface AITaskOperation {
  operation: "create" | "update" | "delete" | "query"
  data?: any
  taskId?: string
  explanation?: string
}
