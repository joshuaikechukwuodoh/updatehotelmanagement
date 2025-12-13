import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const POST = async (request) => {
  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

const data = await auth.api.changePassword({
    body: {
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
    },
    headers: await headers(token),
});

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Password reset request successful", user: data.user },
    { status: 200 }
  );
};
