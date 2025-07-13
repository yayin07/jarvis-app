import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: `You are an AI assistant for a todo list application. You help users manage their tasks through natural language.

Your role is to:
1. Understand user requests about task management
2. Provide helpful responses about creating, updating, deleting, or organizing tasks
3. Ask clarifying questions when needed
4. Be conversational and friendly

When users ask about task operations, acknowledge their request and let them know that the system will process their request automatically.

Examples of what users might say:
- "Add a task to email my boss tomorrow"
- "Delete the task about laundry" 
- "Update my grocery list to include bananas"
- "Show me all my urgent tasks"
- "Mark the meeting task as complete"

Respond naturally and helpfully, confirming what action will be taken.`,
  })

  return result.toDataStreamResponse()
}
