import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import { ensureRedConnectTables } from "@/lib/redconnect-db";

/**
 * POST /api/redconnect/posts/[id]/like
 * Toggle like on a post
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
      const result = (await sql`SELECT * FROM rc_likes WHERE user_id = ${session.user.id} AND post_id = ${id}`) as any[];
      if (!result || result.length === 0) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    }

    // Real Postgres: check existing like, then toggle
    const existing = (await sql`SELECT user_id FROM rc_likes WHERE user_id = ${session.user.id} AND post_id = ${id}`) as any[];

    if (existing && existing.length > 0) {
      // Unlike
      await sql`DELETE FROM rc_likes WHERE user_id = ${session.user.id} AND post_id = ${id}`;
      await sql`UPDATE rc_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ${id}`;
      const post = (await sql`SELECT like_count FROM rc_posts WHERE id = ${id}`) as any[];
      return NextResponse.json({ action: "unliked", like_count: post[0]?.like_count || 0 });
    } else {
      // Like
      await sql`INSERT INTO rc_likes (user_id, post_id) VALUES (${session.user.id}, ${id})`;
      await sql`UPDATE rc_posts SET like_count = like_count + 1 WHERE id = ${id}`;
      const post = (await sql`SELECT like_count FROM rc_posts WHERE id = ${id}`) as any[];
      return NextResponse.json({ action: "liked", like_count: post[0]?.like_count || 1 });
    }
  } catch (error) {
    console.error("RedConnect like toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
