import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import { ensureRedConnectTables } from "@/lib/redconnect-db";

/**
 * POST /api/redconnect/posts/[id]/save
 * Toggle save on a post
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureRedConnectTables();

    const { id } = await params;
    const sql = getSql();

    // Check if the mock SQL handler is active (it handles toggle internally)
    const isMock = !process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL;

    if (isMock) {
      // Mock handler does toggle in one call
      const result = (await sql`SELECT * FROM rc_saves WHERE user_id = ${session.user.id} AND post_id = ${id}`) as any[];
      if (!result || result.length === 0) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    }

    // Real Postgres: check existing save, then toggle
    const existing = (await sql`SELECT user_id FROM rc_saves WHERE user_id = ${session.user.id} AND post_id = ${id}`) as any[];

    if (existing && existing.length > 0) {
      // Unsave
      await sql`DELETE FROM rc_saves WHERE user_id = ${session.user.id} AND post_id = ${id}`;
      await sql`UPDATE rc_posts SET save_count = GREATEST(save_count - 1, 0) WHERE id = ${id}`;
      const post = (await sql`SELECT save_count FROM rc_posts WHERE id = ${id}`) as any[];
      return NextResponse.json({ action: "unsaved", save_count: post[0]?.save_count || 0 });
    } else {
      // Save
      await sql`INSERT INTO rc_saves (user_id, post_id) VALUES (${session.user.id}, ${id})`;
      await sql`UPDATE rc_posts SET save_count = save_count + 1 WHERE id = ${id}`;
      const post = (await sql`SELECT save_count FROM rc_posts WHERE id = ${id}`) as any[];
      return NextResponse.json({ action: "saved", save_count: post[0]?.save_count || 1 });
    }
  } catch (error) {
    console.error("RedConnect save toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
