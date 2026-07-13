import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import { ensureRedConnectTables } from "@/lib/redconnect-db";

/**
 * DELETE /api/redconnect/comments/[id]
 * Delete user's own comment
 */
export async function DELETE(
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

    // First get the comment to find the post_id (for real Postgres)
    const commentRows = (await sql`SELECT post_id FROM rc_comments WHERE id = ${id} AND user_id = ${session.user.id}`) as any[];
    
    if (!commentRows || commentRows.length === 0) {
      return NextResponse.json({ error: "Comment not found or not authorized" }, { status: 404 });
    }
    const postId = commentRows[0].post_id;

    // Delete comment
    await sql`DELETE FROM rc_comments WHERE id = ${id} AND user_id = ${session.user.id}`;

    // Decrement post comment count
    const isMock = !process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL;
    if (!isMock) {
      await sql`UPDATE rc_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ${postId}`;
    }

    return NextResponse.json({ success: true, post_id: postId });
  } catch (error) {
    console.error("RedConnect DELETE comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
