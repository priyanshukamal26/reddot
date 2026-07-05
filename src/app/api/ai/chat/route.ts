import { NextResponse } from "next/server";
import { auth } from "@/auth";

const SAFETY_PREAMBLE = `You are a wellness information assistant inside a menstrual health tracking app.
You are NOT a doctor and must never provide a diagnosis or tell the user they
"have" a medical condition. You can describe what is commonly associated with
the symptoms/data described, in plain, warm, non-alarming language, and you
should consistently encourage the user to discuss anything concerning with a
qualified healthcare provider. Never use definitive diagnostic language
("you have," "this is," "this means you"). Use exploratory, informational
language instead ("this can sometimes be associated with," "many people
experience this when," "this may be worth mentioning to a doctor").
If the input suggests a possible medical emergency (e.g., severe pain,
heavy bleeding described as dangerous, signs of a serious complication),
clearly and immediately recommend seeking medical care promptly, in addition
to anything else you say.`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, recent_data_summary, phase, dayWithinPhase, confidence } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Conversation messages are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GROQ_API_KEY is not set. Returning a mock response.");
      return NextResponse.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello! This is a mock response from RedDot.ai because the GROQ_API_KEY environment variable is not configured. Once configured, I will leverage Llama 3.3 to analyze your cycle patterns and self-logged symptoms.",
            },
          },
        ],
      });
    }

    // Construct custom system prompt using safety preamble + E1 logic verbatim
    const systemPrompt = `${SAFETY_PREAMBLE}

You have access to this user's recent self-logged data, summarized below.
Use it to give specific, personalized answers — refer to their actual logged
symptoms, mood, sleep, or cycle phase when relevant, rather than generic
information. If the data doesn't contain enough information to answer
specifically, say so plainly and answer generally instead of guessing.
Keep responses conversational and concise — a few short paragraphs at most,
not an exhaustive report.

User's recent data summary:
${recent_data_summary || "No recent data logged yet."}

Current cycle phase: ${phase || "unknown"}, day ${dayWithinPhase || 0} of this phase
(cycle prediction confidence: ${confidence || "irregular"})`;

    // Map client messages to OpenAI format (role + content)
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI chat route error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
