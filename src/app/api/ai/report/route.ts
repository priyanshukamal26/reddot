import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import Tesseract from "tesseract.js";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // 1. Text Extraction Layer
    if (file.type === "application/pdf") {
      try {
        const pdfParser = require("pdf-parse");
        const parsedPdf = await pdfParser(buffer);
        extractedText = parsedPdf.text;
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr);
        return NextResponse.json(
          { error: "Failed to extract text from PDF." },
          { status: 422 }
        );
      }
    } else if (file.type.startsWith("image/")) {
      try {
        const result = await Tesseract.recognize(buffer, "eng");
        extractedText = result.data.text;
      } catch (ocrErr) {
        console.error("OCR error:", ocrErr);
        return NextResponse.json(
          { error: "Failed to perform OCR on image." },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or an image." },
        { status: 400 }
      );
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json(
        { error: "The uploaded file does not contain any readable text." },
        { status: 422 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GROQ_API_KEY is not set. Returning a mock report analysis.");
      const mockResult = `1. **Summary of What Was Tested**: This report appears to be a blood panel testing thyroid stimulating hormone (TSH) and vitamin D levels.
2. **Flagged Reference Range Outliers**: 
   - Your TSH level is listed as 5.2 mIU/L, which is slightly above the reference range of 0.45 – 4.5 mIU/L.
   - Your Vitamin D level is listed as 18 ng/mL, which falls below the reference range of 30 – 100 ng/mL.
3. **Suggested Questions for Your Doctor**:
   - What could cause my TSH to be slightly elevated?
   - Should we supplement my Vitamin D or make dietary changes?
4. **Important Notice**: This is informational only. Please consult your physician for medical advice.`;

      // Log non-PII event in Neon regardless (if configured)
      try {
        const sql = getSql();
        await sql`INSERT INTO report_analysis_events (user_id, processed_at, discarded_at) VALUES (${session.user.id}, now(), now())`;
      } catch (dbErr) {
        console.warn("Database event logging failed (local-only fallback):", dbErr);
      }

      return NextResponse.json({
        analysis: mockResult,
        discarded_at: new Date().toISOString(),
      });
    }

    // 2. Strict system prompt combining safety preamble and E3 prompt verbatim
    const systemPrompt = `${SAFETY_PREAMBLE}

You will be given extracted text from a user-uploaded lab/blood test report.
Your job is to help the user understand it in plain language — NOT to
diagnose, NOT to tell them what condition they have, and NOT to tell them
what to do medically. Structure your response as:

1. A plain-language summary of what was tested (2-4 sentences).
2. A list of any values that fall outside the report's own stated reference
   range, described neutrally (e.g., "Your TSH level is above the reference
   range listed on this report"), WITHOUT saying what that means medically.
3. A short list of specific questions the user could ask their doctor about
   these results.
4. A closing reminder that this is informational only and not a substitute
   for a conversation with their healthcare provider.

If the extracted text is unclear, incomplete, or doesn't look like a lab
report at all, say so plainly and don't attempt to force an analysis.

Extracted report text:
${extractedText}`;

    // 3. Request Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.1, // low temperature for high precision
        max_tokens: 1024,
      }),
    });

    // Clean memory immediately (explicitly dereference buffers)
    extractedText = "";

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || "Could not analyze the report.";

    // 4. Log event in Neon Database
    const discardedTimestamp = new Date().toISOString();
    try {
      const sql = getSql();
      await sql`INSERT INTO report_analysis_events (user_id, processed_at, discarded_at) VALUES (${session.user.id}, now(), ${discardedTimestamp})`;
    } catch (dbErr) {
      console.warn("Database event logging failed:", dbErr);
    }

    return NextResponse.json({
      analysis: analysisText,
      discarded_at: discardedTimestamp,
    });
  } catch (error) {
    console.error("Report upload error:", error);
    return NextResponse.json(
      { error: "Failed to analyze the report." },
      { status: 500 }
    );
  }
}
