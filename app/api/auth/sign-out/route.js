import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  const data = await auth.api.signOut({
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  return NextResponse.json(
    { message: "User signed out successfully", user: data.user },
    { status: 200 }
  );
};
