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

When asked to create a task, ONLY generate ONE todo in a JSON array (max length 1).
Example:
[
  {
    "title": "Buy groceries",
    "description": "Milk, eggs, and bread",
    "completed": false,
    "priority": "MEDIUM",
    "category": "Personal",
    "dueDate": "2025-07-15T18:00:00Z"
  }
]

If the user says “create 5 tasks”, respond with just 1 and say why.
If the user is just chatting, reply conversationally without any JSON.
Never use markdown.
            `,
          },
          {
            role: "user",
            content: `Based on: "${prompt}"`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      console.error("❌ AI fetch failed:", aiResponse.status, text);
      return NextResponse.json({ error: "AI call failed" }, { status: 500 });
    }

    const data = await aiResponse.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.trim();

    // Case 1: Not a JSON array (chat reply only)
    if (!cleaned.startsWith("[") || !cleaned.endsWith("]")) {
      return NextResponse.json({
        reply: cleaned,
        rawAIResponse: null,
      });
    }

    // Case 2: Parse JSON array (limit to 1)
    let todos: any[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      todos = parsed.slice(0, 1);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return NextResponse.json({ reply: cleaned, rawAIResponse: null });
    }

    return NextResponse.json({
      reply: "✅ Got it! I've added that to your tasks.",
      rawAIResponse: todos,
    });
  } catch (err) {
    console.error("❌ Chat route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
