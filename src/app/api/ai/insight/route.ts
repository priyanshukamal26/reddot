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

    const { recent_data_summary, phase, dayWithinPhase, confidence } =
      await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GROQ_API_KEY is not set. Returning a mock dynamic insight.");
      
      // Fallback heuristic based on phase and symptoms if key is missing
      let heuristicInsight = "Your tracking consistency is excellent. Logging your symptoms daily helps build your personalized health history.";
      
      if (phase === "menstrual") {
        heuristicInsight = `You are currently in your menstrual phase (Day ${dayWithinPhase}). Remember to stay hydrated, rest, and log any changes in flow or cramps to help track your cycle patterns.`;
      } else if (phase === "ovulation") {
        heuristicInsight = `You are currently in your ovulation phase. This is often associated with higher energy levels. Logging your symptoms now helps clarify your energy shifts.`;
      } else if (phase === "luteal") {
        heuristicInsight = `You are in your luteal phase (Day ${dayWithinPhase}). It is common to experience changes in sleep quality or mood during this time. Rest when needed.`;
      } else if (recent_data_summary && recent_data_summary.includes("cramps")) {
        heuristicInsight = "You logged cramps recently. Keep track of when they occur within your cycle phases to share with your doctor.";
      }

      return NextResponse.json({ insight: heuristicInsight });
    }

    // Construct system prompt combining safety preamble and E2 prompt logic verbatim
    const systemPrompt = `${SAFETY_PREAMBLE}

Generate a short (2-3 sentence) personalized insight card for this user's
dashboard, based on their recent logged data below. It should feel specific
to them, not generic. Reference their actual phase, symptoms, or mood
patterns if there's something genuinely notable; if there isn't anything
notable yet, give a short encouraging note about their tracking consistency
instead of inventing a pattern. Never fabricate a pattern that isn't
supported by the data provided. Warm, plain tone — no medical jargon.

User's recent data summary:
${recent_data_summary || "No recent data logged yet."}

Current cycle phase: ${phase || "unknown"}, day ${dayWithinPhase || 0} of this phase
(cycle prediction confidence: ${confidence || "irregular"})`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error (insights):", errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const insightText = data.choices?.[0]?.message?.content || "Keep tracking daily to prompt private recommendations & correlation insights.";

    return NextResponse.json({ insight: insightText.trim() });
  } catch (error) {
    console.error("AI insight API error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insight." },
      { status: 500 }
    );
  }
}
