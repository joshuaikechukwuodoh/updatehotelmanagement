import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

export const POST = async (request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    //validate
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400 }
      );
    }

    // save message in DB
    const [message] = await db
      .insert(messages)
      .values({
        sender_id: session.user.id,
        receiver_id: receiverId,
        content,
      })
      .returning();

    // send real-time message
    await pusher.trigger(
      `private-user-${receiverId}`, // channel
      "new-message", // event
      message
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
};
