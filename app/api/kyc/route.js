import { NextResponse } from "next/server";
import { db } from "@/db";
import { kyc } from "@/db/schema";
import { auth } from "@/lib/auth";

export const POST = async (request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentType, documentUrl } = body;

    if (!documentType || !documentUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [record] = await db
      .insert(kyc)
      .values({
        user_id: session.user.id,
        document_type: documentType,
        document_url: documentUrl,
        status: "PENDING",
      })
      .returning();

    return NextResponse.json(record);
  } catch (error) {
    console.error("KYC upload error:", error);
    return NextResponse.json(
      { error: "KYC submission failed" },
      { status: 500 }
    );
  }
};
