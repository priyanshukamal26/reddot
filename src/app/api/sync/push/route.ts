import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSql } from "@/lib/neon";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blob_type, ciphertext, iv } = await request.json();

    if (!blob_type || !ciphertext || !iv) {
      return NextResponse.json(
        { error: "blob_type, ciphertext, and iv are required." },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Upsert the encrypted sync blob
    const result = (await sql`
      INSERT INTO encrypted_blobs (user_id, blob_type, ciphertext, iv, updated_at)
      VALUES (${session.user.id}, ${blob_type}, ${ciphertext}, ${iv}, now())
      ON CONFLICT (user_id, blob_type)
      DO UPDATE SET 
        ciphertext = EXCLUDED.ciphertext,
        iv = EXCLUDED.iv,
        updated_at = now()
      RETURNING updated_at
    `) as any[];

    const updated_at = result[0].updated_at;

    return NextResponse.json({ success: true, updated_at });
  } catch (error) {
    console.error("Sync push error:", error);
    return NextResponse.json(
      { error: "Internal server error during sync push" },
      { status: 500 }
    );
  }
}
