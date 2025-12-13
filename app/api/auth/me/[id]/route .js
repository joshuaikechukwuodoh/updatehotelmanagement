import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";

export const GET = async (request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });

  return NextResponse.json(user);
};
