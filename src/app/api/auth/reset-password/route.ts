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

    // Find user
    const users = (await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`) as any[];
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    const userId = users[0].id;

    // Hash new password on server
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password hash and salt
    await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${userId}`;
    await sql`UPDATE user_meta SET salt = ${salt} WHERE user_id = ${userId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error during password reset." },
      { status: 500 }
    );
  }
}
