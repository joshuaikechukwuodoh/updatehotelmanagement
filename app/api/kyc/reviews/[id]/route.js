import { NextResponse } from "next/server";
import { db } from "@/db";
import { kyc } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const PATCH = async (request, { params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updated] = await db
      .update(kyc)
      .set({ status })
      .where(eq(kyc.id, Number(params.id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("KYC update error:", error);
    return NextResponse.json({ error: "KYC update failed" }, { status: 500 });
  }
};
