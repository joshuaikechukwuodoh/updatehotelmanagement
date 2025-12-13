import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { payments, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const POST = async (request) => {
  try {
    // Get raw body (VERY IMPORTANT)
    const rawBody = await request.text();

    // Get Paystack signature from headers
    const paystackSignature = request.headers.get("x-paystack-signature");

    // Create our own signature using secret key
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    // Compare signatures (security check)
    if (hash !== paystackSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse body AFTER verification
    const event = JSON.parse(rawBody);

    // We only care about successful payments
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: false });
    }

    const reference = event.data.reference;
    const bookingId = event.data.metadata?.bookingId;

    if (!reference || !bookingId) {
      return NextResponse.json(
        { error: "Missing payment data" },
        { status: 400 }
      );
    }

    // Get payment from DB
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, reference));

    // If payment not found OR already completed → stop
    if (!payment || payment.status === "COMPLETED") {
      return NextResponse.json({ received: false });
    }

    // Mark payment as COMPLETED
    await db
      .update(payments)
      .set({ status: "COMPLETED" })
      .where(eq(payments.id, payment.id));

    // Mark booking as PAID
    await db
      .update(bookings)
      .set({ payment_status: "PAID" })
      .where(eq(bookings.id, bookingId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
};
