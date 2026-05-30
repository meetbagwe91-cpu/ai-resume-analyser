import { type ActionFunctionArgs } from "react-router";
import Razorpay from "razorpay";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { packageId } = await request.json().catch(() => ({ packageId: "" }));

  let amountInPaise = 0;
  if (packageId === "auto-optimize") {
    amountInPaise = 1900; // ₹19
  } else if (packageId === "build-ai") {
    amountInPaise = 1900; // ₹19
  } else if (packageId === "bundle") {
    amountInPaise = 2900; // ₹29
  } else {
    return Response.json({ error: "Invalid package selected" }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return Response.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      packageId,
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return Response.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
