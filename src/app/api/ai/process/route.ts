import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

const TaskOperationSchema = z.object({
  operations: z.array(
    z.object({
      operation: z.enum(["create", "update", "delete", "query"]),
      data: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
          category: z.string().optional(),
          dueDate: z.string().optional(),
          completed: z.boolean().optional(),
        })
        .optional(),
      taskId: z.string().optional(),
      searchQuery: z.string().optional(),
      explanation: z.string(),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)

    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { message } = await request.json()

    // Get user's current todos for context
    const userTodos = await prisma.todo.findMany({
      where: { userId: authUser.userId },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        category: true,
        dueDate: true,
      },
    })

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: TaskOperationSchema,
      prompt: `
        Analyze this user message and determine what task operations should be performed: "${message}"
        
        Current user todos:
        ${JSON.stringify(userTodos, null, 2)}
        
        Based on the message, generate the appropriate operations. For each operation:
        
        CREATE operations should include:
        - title (required)
        - description (optional)
        - priority (LOW/MEDIUM/HIGH, default MEDIUM)
        - category (optional)
        - dueDate (ISO string if mentioned, optional)
        
        UPDATE operations should include:
        - taskId (match from existing todos)
        - data with fields to update
        
        DELETE operations should include:
        - taskId (match from existing todos)
        
        QUERY operations are for searching/filtering (not implemented yet)
        
        Always provide an explanation for each operation.
        
        Examples:
        - "Add a task to email my boss tomorrow" → CREATE with title "Email my boss", dueDate tomorrow
        - "Delete the laundry task" → DELETE matching todo with "laundry" in title
        - "Mark the meeting as high priority" → UPDATE matching todo with priority HIGH
        - "Complete the grocery shopping task" → UPDATE matching todo with completed true
      `,
    })

    return NextResponse.json(result.object.operations)
  } catch (error) {
    console.error("AI processing error:", error)
    return new NextResponse("Failed to process AI request", { status: 500 })
  }
}
