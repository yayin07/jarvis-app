import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const user = getAuthUser(req);

    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "addTodo",
          description: "Create a new todo",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH"],
              },
              category: { type: "string" },
              dueDate: { type: "string", format: "date-time" },
            },
            required: ["title"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "updateTodo",
          description: "Update a todo by its title",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Existing todo title" },
              newTitle: { type: "string" },
              description: { type: "string" },
              completed: { type: "boolean" },
              priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
              category: { type: "string" },
              dueDate: { type: "string", format: "date-time" },
            },
            required: ["title"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "deleteTodo",
          description: "Delete a todo by its title",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
            },
            required: ["title"],
          },
        },
      },
    ];

    const aiResponse = await fetch(`${process.env.OPENROUTER_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Todo App",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: `
You are a smart assistant for a todo app.

Your job is to help users manage their tasks using structured tools.

Supported actions:
- Create a todo (use addTodo)
- Update a todo (use updateTodo)
- Delete a todo (use deleteTodo)

Always call the appropriate tool instead of replying with plain text when a user clearly wants to create, update, or delete a task.

Rules:
- Only perform ONE action at a time (create, update, or delete).
- If the user mixes actions or is unclear, ask them to clarify.
- Use only the title to identify a todo when updating or deleting.
- If the task is not found, return an appropriate message via tool result.
- If the user says “create 5 tasks”, respond with just 1 and explain why.
- For casual chatting, respond conversationally without calling tools.
- Never use markdown formatting in your replies.
          `
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools,
      }),
    });

    const data = await aiResponse.json();
    const message = data?.choices?.[0]?.message;

    const toolCall = message?.tool_calls?.[0];
    if (toolCall) {
      const { name, arguments: argsStr } = toolCall.function;
      const args = JSON.parse(argsStr);

      switch (name) {
        case "addTodo": {
          const created = await prisma.todo.create({
            data: {
              title: args.title,
              description: args.description ?? "",
              priority: args.priority ?? "MEDIUM",
              category: args.category ?? "",
              dueDate: args.dueDate ? new Date(args.dueDate) : null,
              completed: false,
              userId: user.userId,
            },
          });
          return NextResponse.json({ reply: `✅ Todo "${created.title}" added.` });
        }

        case "updateTodo": {
          const existing = await prisma.todo.findFirst({
            where: {
              title: {
                equals: args.title,
                mode: "insensitive",
              },
              userId: user.userId,
            },
          });

          if (!existing) {
            return NextResponse.json({ reply: `❌ Todo "${args.title}" not found.` });
          }

          const updated = await prisma.todo.update({
            where: { id: existing.id },
            data: {
              title: args.newTitle ?? existing.title,
              description: args.description ?? existing.description,
              completed: args.completed ?? existing.completed,
              priority: args.priority ?? existing.priority,
              category: args.category ?? existing.category,
              dueDate: args.dueDate ? new Date(args.dueDate) : existing.dueDate,
            },
          });
          return NextResponse.json({ reply: `✅ Todo "${updated.title}" updated.` });
        }

        case "deleteTodo": {
          const found = await prisma.todo.findFirst({
            where: {
              title: {
                equals: args.title,
                mode: "insensitive",
              },
              userId: user.userId,
            },
          });

          if (!found) {
            return NextResponse.json({ reply: `❌ Todo "${args.title}" not found.` });
          }

          await prisma.todo.delete({ where: { id: found.id } });
          return NextResponse.json({ reply: `🗑️ Todo "${args.title}" deleted.` });
        }

        default:
          return NextResponse.json({ reply: "🤖 Unknown tool call." });
      }
    }

    return NextResponse.json({
      reply: message?.content ?? "🤖 No response from AI.",
    });
  } catch (err) {
    console.error("❌ Chat route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
