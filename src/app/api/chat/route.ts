import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const response = await fetch(`${process.env.OPENROUTER_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
        "X-Title": "AI Todo App",         
      },
      body: JSON.stringify({
        model: "openai/gpt-4o", // or claude-3, etc
        messages: [
          {
            role: "system",
            content: "You are an assistant that only returns valid JSON arrays. Never include explanations, markdown, or extra formatting.",
          },
          {
            role: "user",
            content: `Generate exactly 5 todo items based on: "${prompt}". Respond ONLY with a JSON array. Example: ["Buy groceries", "Read book"]`,
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

    let todos: string[] = [];

    try {
      // Extract the first valid JSON array using regex
      const match = cleaned.match(/\[[\s\S]*?\]/);
      if (!match) throw new Error("No JSON array found in AI response");

      const parsed = JSON.parse(match[0]);

      if (Array.isArray(parsed)) {
        todos = parsed;
      } else {
        throw new Error("Parsed content is not an array");
      }
    } catch (err) {
      console.error("JSON parse error:", err);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ todos });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}


