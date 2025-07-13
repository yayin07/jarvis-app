// route.ts — /api/process

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const response = await fetch(`${process.env.OPENROUTER_URL}/chat/completions`, {
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
            content: "You are an AI that helps manage todos. Respond ONLY with a JSON array of operations like: [{\"operation\": \"create\", \"data\": {\"text\": \"...\"}}]. No explanation or markdown.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter error:", response.status, await response.text());
      return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    // Remove markdown wrapping if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    let operations: any[] = [];

    try {
      const match = cleaned.match(/\[[\s\S]*?\]/);
      if (!match) throw new Error("No JSON array found");

      const parsed = JSON.parse(match[0]);

      if (Array.isArray(parsed)) {
        operations = parsed;
      } else {
        throw new Error("Parsed content is not an array");
      }
    } catch (err) {
      console.error("JSON parse error:", err);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(operations);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
