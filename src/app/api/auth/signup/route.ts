import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, salt } = await request.json();

    if (!email || !password || !salt) {
      return NextResponse.json(
        { error: "Email, password, and salt are required." },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Check if user already exists
    const existing = (await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`) as any[];

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password on server
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user and metadata (in separate steps, since serverless pg supports multi-queries or single queries)
    const result = (await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hashedPassword}) RETURNING id`) as any[];

    if (!result || result.length === 0) {
      throw new Error("Failed to insert user into database.");
    }

    const userId = result[0].id;

    // Insert salt and initial metadata
    await sql`INSERT INTO user_meta (user_id, salt, onboarding_done) VALUES (${userId}, ${salt}, false)`;

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
