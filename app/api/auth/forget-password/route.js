import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import mailer from "@/lib/mailer";

export const POST = async (request) => {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const data = await auth.api.requestForgetPassword({
    body: {
      email,
      redirectTo: "/reset-password", // Adding a default redirect
    },
  });

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Password reset request successful", user: data.user },
    { status: 200 }
  );
};
