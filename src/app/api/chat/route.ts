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
              dueDate: {
                type: "string",
                format: "date-time",
                description: "Optional ISO 8601 date",
              },
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

Today's date is: ${new Date().toISOString()} 

Your job is to help users manage their tasks using structured tools.

Supported actions:
- Create a todo (use addTodo)
- Update a todo (use updateTodo)
- Delete a todo (use deleteTodo)

⚠️ VERY IMPORTANT:
- If the user mentions dates like "tomorrow", "next week", or "July 20", always convert it to a valid ISO 8601 datetime string in UTC format. Example: "2025-07-15T10:00:00Z"
- If no due date is given, omit it or set it to null.

Other Rules:
- Only perform ONE action at a time.
- Use only the title to identify a todo when updating or deleting.
- Always default priority to "LOW" if not given.
- Titles are case-insensitive.
- Never use markdown in your reply.
`.trim(),
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
              priority: args.priority ?? "LOW", // ✅ default to LOW
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
