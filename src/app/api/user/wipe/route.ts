import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();

    // 1. Delete all encrypted blobs from Postgres
    await sql`DELETE FROM encrypted_blobs WHERE user_id = ${session.user.id}`;

    // 2. Delete all report analysis events from Postgres
    await sql`DELETE FROM report_analysis_events WHERE user_id = ${session.user.id}`;

    // 3. Reset metadata in user_meta and users tables
    await sql`UPDATE user_meta SET onboarding_done = false, last_export_at = null WHERE user_id = ${session.user.id}`;
    await sql`UPDATE users SET sync_enabled = false WHERE id = ${session.user.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wipe data error:", error);
    return NextResponse.json(
      { error: "Internal server error during data wipe." },
      { status: 500 }
    );
  }
}
