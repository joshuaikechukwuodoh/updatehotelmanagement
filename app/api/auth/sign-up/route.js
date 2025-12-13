import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  if (password.length > 32) {
    return NextResponse.json(
      { error: "Password must be at most 32 characters long" },
      { status: 400 }
    );
  }

  if (password.includes(" ")) {
    return NextResponse.json(
      { error: "Password must not contain spaces" },
      { status: 400 }
    );
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const data = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Account created successfully", user: data.user },
    { status: 201 }
  );
};
