import { type ActionFunctionArgs } from "react-router";
import crypto from "crypto";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  // Get raw body as text
  const bodyText = await request.text();
  
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    // If webhook secret isn't configured, we just return 200 so Razorpay doesn't retry
    console.warn("RAZORPAY_WEBHOOK_SECRET is not configured. Ignoring webhook.");
    return Response.json({ status: "ignored" });
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyText)
    .digest("hex");

  if (expectedSignature !== signature) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Process the webhook payload
  try {
    const payload = JSON.parse(bodyText);
    const event = payload.event;
    
    console.log(`[Webhook Received] ${event}`);

    // In a full implementation, you would update your database based on the event:
    if (event === "payment.captured") {
      // Payment was successful
      // Find the user associated with this order/payment and mark them as premium
    } else if (event === "order.paid") {
      // Order is fully paid
    }
    
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: "Processing failed" }, { status: 500 });
  }
}
