import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";
import { ensureRedConnectTables } from "@/lib/redconnect-db";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * GET /api/redconnect/posts
 * Query params: ?filter=all|my|saved  &tag=query|experience|suggestion|general
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureRedConnectTables();
    
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all";
    const tag = url.searchParams.get("tag") || "";
    const q = url.searchParams.get("q") || "";
    
    const limitParam = parseInt(url.searchParams.get("limit") || "30", 10);
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
    
    // Safety bounds
    const limit = Math.max(1, Math.min(100, limitParam));
    const page = Math.max(1, pageParam);
    const offset = (page - 1) * limit;

    const sql = getSql();
    let posts = [] as any[];
    const searchPattern = q ? `%${q}%` : "";

    if (filter === "saved") {
      if (tag) {
        if (q) {
          posts = await sql`
            SELECT p.* FROM rc_posts p
            JOIN rc_saves s ON p.id = s.post_id
            WHERE s.user_id = ${session.user.id} AND p.tag = ${tag} AND (p.content ILIKE ${searchPattern} OR p.username ILIKE ${searchPattern})
            ORDER BY p.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          posts = await sql`
            SELECT p.* FROM rc_posts p
            JOIN rc_saves s ON p.id = s.post_id
            WHERE s.user_id = ${session.user.id} AND p.tag = ${tag}
            ORDER BY p.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      } else {
        if (q) {
          posts = await sql`
            SELECT p.* FROM rc_posts p
            JOIN rc_saves s ON p.id = s.post_id
            WHERE s.user_id = ${session.user.id} AND (p.content ILIKE ${searchPattern} OR p.username ILIKE ${searchPattern})
            ORDER BY p.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          posts = await sql`
            SELECT p.* FROM rc_posts p
            JOIN rc_saves s ON p.id = s.post_id
            WHERE s.user_id = ${session.user.id}
            ORDER BY p.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      }
    } else if (filter === "my") {
      if (tag) {
        if (q) {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE user_id = ${session.user.id} AND tag = ${tag} AND (content ILIKE ${searchPattern} OR username ILIKE ${searchPattern})
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE user_id = ${session.user.id} AND tag = ${tag}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      } else {
        if (q) {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE user_id = ${session.user.id} AND (content ILIKE ${searchPattern} OR username ILIKE ${searchPattern})
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE user_id = ${session.user.id}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      }
    } else {
      if (tag) {
        if (q) {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE tag = ${tag} AND (content ILIKE ${searchPattern} OR username ILIKE ${searchPattern})
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE tag = ${tag}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      } else {
        if (q) {
          posts = await sql`
            SELECT * FROM rc_posts
            WHERE content ILIKE ${searchPattern} OR username ILIKE ${searchPattern}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          posts = await sql`
            SELECT * FROM rc_posts
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      }
    }

    // Determine hasMore based on whether we got exactly `limit` items back
    const hasMore = posts.length === limit;

    // We still need to fetch likes/saves context for the current user
    const likes = (await sql`SELECT post_id FROM rc_likes WHERE user_id = ${session.user.id}`) as any[];
    const saves = (await sql`SELECT post_id FROM rc_saves WHERE user_id = ${session.user.id}`) as any[];

    const likedPostIds = new Set(likes.map((l: any) => l.post_id));
    const savedPostIds = new Set(saves.map((s: any) => s.post_id));

    const annotatedPosts = posts.map((post: any) => ({
      ...post,
      is_liked: likedPostIds.has(post.id),
      is_saved: savedPostIds.has(post.id),
      is_own: post.user_id === session.user.id,
    }));

    return NextResponse.json({ posts: annotatedPosts, hasMore, page });
  } catch (error) {
    console.error("RedConnect GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/redconnect/posts
 * Body: { content, image_url?, tag }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureRedConnectTables();

    const { content, image_url, tag } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Post content is required." }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Post content must be under 2000 characters." }, { status: 400 });
    }

    // Get username from email
    const sql = getSql();
    const userRows = (await sql`SELECT email FROM users WHERE id = ${session.user.id} LIMIT 1`) as any[];
    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const email = userRows[0].email;
    const username = email.split("@")[0];

    const postId = generateId();
    const now = new Date().toISOString();
    const validTag = ["query", "experience", "suggestion", "general"].includes(tag) ? tag : "general";

    const result = (await sql`INSERT INTO rc_posts (id, user_id, username, content, image_url, tag, created_at, updated_at) VALUES (${postId}, ${session.user.id}, ${username}, ${content.trim()}, ${image_url || null}, ${validTag}, ${now}, ${now}) RETURNING *`) as any[];

    return NextResponse.json({ post: result[0] });
  } catch (error) {
    console.error("RedConnect POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
