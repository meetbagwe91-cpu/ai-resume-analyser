import { type ActionFunctionArgs } from "react-router";
import crypto from "crypto";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ success: false, error: "Missing required payment fields" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("RAZORPAY_KEY_SECRET is not defined in environment variables");
    return Response.json({ success: false, error: "Server configuration error" }, { status: 500 });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment is verified on the server side!
    // Since we don't have firebase-admin configured, we'll return success to the frontend
    // which will then perform the final Firestore update.
    return Response.json({ success: true });
  }

  return Response.json({ success: false, error: "Invalid signature" }, { status: 400 });
}
