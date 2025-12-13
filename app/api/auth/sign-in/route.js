import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  return NextResponse.json(
    { message: "User signed in successfully", user: data.user },
    { status: 200 }
  );
};
