import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();
    const result = (await sql`
      SELECT m.onboarding_done, u.sync_enabled, m.last_export_at, m.salt, u.email
      FROM user_meta m
      JOIN users u ON m.user_id = u.id
      WHERE m.user_id = ${session.user.id} LIMIT 1
    `) as any[];

    if (!result || result.length === 0) {
      // If user exists but user_meta doesn't, initialize it (fallback)
      const userExists = (await sql`SELECT email FROM users WHERE id = ${session.user.id} LIMIT 1`) as any[];
      if (!userExists || userExists.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        onboarding_done: false,
        sync_enabled: false,
        last_export_at: null,
        salt: "",
        email: userExists[0].email,
      });
    }

    const meta = result[0];
    return NextResponse.json({
      onboarding_done: meta.onboarding_done,
      sync_enabled: meta.sync_enabled,
      last_export_at: meta.last_export_at,
      salt: meta.salt,
      email: meta.email,
    });
  } catch (error) {
    console.error("Fetch user meta error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { onboarding_done, sync_enabled, last_export_at } = await request.json();
    const sql = getSql();

    // Check if user has sync_enabled in users table too
    if (sync_enabled !== undefined) {
      await sql`UPDATE users SET sync_enabled = ${sync_enabled} WHERE id = ${session.user.id}`;
    }

    // Upsert into user_meta
    await sql`
      INSERT INTO user_meta (user_id, onboarding_done, sync_enabled, last_export_at, salt)
      VALUES (
        ${session.user.id}, 
        ${onboarding_done !== undefined ? onboarding_done : false}, 
        ${sync_enabled !== undefined ? sync_enabled : false}, 
        ${last_export_at !== undefined ? last_export_at : null}, 
        ''
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        onboarding_done = COALESCE(${onboarding_done !== undefined ? onboarding_done : null}, user_meta.onboarding_done),
        sync_enabled = COALESCE(${sync_enabled !== undefined ? sync_enabled : null}, user_meta.sync_enabled),
        last_export_at = COALESCE(${last_export_at !== undefined ? last_export_at : null}, user_meta.last_export_at)
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user meta error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
