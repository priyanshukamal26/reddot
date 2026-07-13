import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import { ensureRedConnectTables } from "@/lib/redconnect-db";

/**
 * DELETE /api/redconnect/posts/[id]
 * Delete user's own post
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

    const result = (await sql`DELETE FROM rc_posts WHERE id = ${id} AND user_id = ${session.user.id} RETURNING id`) as any[];

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Post not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RedConnect DELETE post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
