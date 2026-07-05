import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blobType = searchParams.get("blob_type") || "full_sync";

    const sql = getSql();

    const result = (await sql`
      SELECT blob_type, ciphertext, iv, updated_at
      FROM encrypted_blobs
      WHERE user_id = ${session.user.id} AND blob_type = ${blobType} LIMIT 1
    `) as any[];

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "No sync blob found of this type." },
        { status: 404 }
      );
    }

    const blob = result[0];
    return NextResponse.json({
      blob_type: blob.blob_type,
      ciphertext: blob.ciphertext,
      iv: blob.iv,
      updated_at: blob.updated_at,
    });
  } catch (error) {
    console.error("Sync pull error:", error);
    return NextResponse.json(
      { error: "Internal server error during sync pull" },
      { status: 500 }
    );
  }
}
