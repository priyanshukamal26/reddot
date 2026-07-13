import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import { ensureRedConnectTables } from "@/lib/redconnect-db";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * GET /api/redconnect/posts/[id]/comments
 * Fetch all comments for a post
 */
export async function GET(
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

    const comments = (await sql`SELECT * FROM rc_comments WHERE post_id = ${id} ORDER BY created_at ASC`) as any[];
    
    // Annotate comments with ownership
    const annotatedComments = comments.map((c: any) => ({
      ...c,
      is_own: c.user_id === session.user.id,
    }));

    return NextResponse.json({ comments: annotatedComments });
  } catch (error) {
    console.error("RedConnect GET comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/redconnect/posts/[id]/comments
 * Create a new comment on a post
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

    const { content } = await request.json();
    const { id } = await params;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required." }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Comment must be under 1000 characters." }, { status: 400 });
    }

    const sql = getSql();

    // Verify post exists
    const postRows = (await sql`SELECT id FROM rc_posts WHERE id = ${id} LIMIT 1`) as any[];
    if (!postRows || postRows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get username
    const userRows = (await sql`SELECT email FROM users WHERE id = ${session.user.id} LIMIT 1`) as any[];
    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const username = userRows[0].email.split("@")[0];

    const commentId = generateId();
    const now = new Date().toISOString();

    const result = (await sql`
      INSERT INTO rc_comments (id, post_id, user_id, username, content, created_at, updated_at)
      VALUES (${commentId}, ${id}, ${session.user.id}, ${username}, ${content.trim()}, ${now}, ${now})
      RETURNING *
    `) as any[];

    // Increment post comment count
    const isMock = !process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL;
    if (!isMock) {
      await sql`UPDATE rc_posts SET comment_count = comment_count + 1 WHERE id = ${id}`;
    }

    const newComment = { ...result[0], is_own: true };
    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error("RedConnect POST comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
