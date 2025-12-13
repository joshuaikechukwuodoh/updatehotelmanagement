import { NextResponse } from "next/server";
import { db } from "@/db";
import { housekeeping, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: get a single housekeeping task by ID
export const GET = async (request, { params }) => {
  try {
    const taskId = Number((await params).id);

    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const [task] = await db
      .select()
      .from(housekeeping)
      .where(eq(housekeeping.id, taskId));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching housekeeping task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PUT: update housekeeping task (HOUSEKEEPING only)
export const PUT = async (request, { params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Only housekeeping staff can update tasks
    if (!session || session.user.role !== "HOUSEKEEPING") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = Number((await params).id);

    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const body = await request.json();

    // Housekeeping can only update notes + status
    const allowed = {
      notes: body.notes,
      status: body.status,
    };

    // Update the task
    const [updatedTask] = await db
      .update(housekeeping)
      .set(allowed)
      .where(eq(housekeeping.id, taskId))
      .returning();

    // If the task is finished → mark room as AVAILABLE
    if (body.status === "DONE") {
      await db
        .update(rooms)
        .set({ status: "AVAILABLE" })
        .where(eq(rooms.id, updatedTask.room_id));
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating housekeeping task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
