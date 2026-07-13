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
to anything else you say.

FORMATTING RULE: Do not output long paragraphs or dense walls of text. Keep your responses highly structured, concise, and easy to scan:
- Keep paragraphs to a maximum of 2 sentences.
- Group related points or advice into clear categories with short headers (e.g., "### Symptom Observations" or "### Recommended Actions").
- Use bullet points (using standard markdown "- **[Topic]:** [details]") to list details, cycle patterns, suggestions, or insights.
- Each bullet point must highlight the key topic in bold.`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, recent_data_summary, phase, dayWithinPhase, confidence, generate_title } =
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
        title: generate_title ? "Mock Chat" : undefined,
      });
    }

    // Construct custom system prompt using safety preamble + E1 logic verbatim
    const systemPrompt = `${SAFETY_PREAMBLE}

You have access to this user's recent self-logged data, summarized below.
Use it to give specific, personalized answers — refer to their actual logged
symptoms, mood, sleep, or cycle phase when relevant, rather than generic
information. If the data doesn't contain enough information to answer
specifically, say so plainly and answer generally instead of guessing.

Always output in a structured points-and-cards friendly format:
1. Start with a 1-sentence warm, personal greeting or cycle phase overview.
2. Break down insights, analysis, or guidance into 2-3 logical categories using "### [Category]" markdown headers.
3. List findings using bullet points starting with "- **[Title]:** Description".
4. End with a 1-sentence supportive follow-up question.

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

    let titlePromise = Promise.resolve<string | null>(null);
    if (generate_title && messages.length > 0) {
      const firstUserMsg = messages.find((m: any) => m.role === "user")?.content || messages[0].content;
      titlePromise = fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a summarization assistant. Summarize the user's question into a short, descriptive 2-4 word title. Do not use quotes, punctuation, or wrapping. Respond with ONLY the title. E.g., 'Cramps & bloating' or 'Late period concern'."
            },
            {
              role: "user",
              content: firstUserMsg,
            }
          ],
          temperature: 0.3,
          max_tokens: 20,
        }),
      })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.choices?.[0]?.message?.content?.replace(/["']/g, "").trim() || null)
      .catch((err) => {
        console.error("Title generation error:", err);
        return null;
      });
    }

    const [response, generatedTitle] = await Promise.all([
      fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      }),
      titlePromise,
    ]);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    if (generatedTitle) {
      data.title = generatedTitle;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI chat route error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
