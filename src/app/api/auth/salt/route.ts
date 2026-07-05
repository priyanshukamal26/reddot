import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required." },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Query salt from user_meta via join
    const result = (await sql`
      SELECT m.salt 
      FROM user_meta m
      JOIN users u ON m.user_id = u.id
      WHERE u.email = ${email} LIMIT 1
    `) as any[];

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    return NextResponse.json({ salt: result[0].salt });
  } catch (error) {
    console.error("Salt fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching salt." },
      { status: 500 }
    );
  }
}
