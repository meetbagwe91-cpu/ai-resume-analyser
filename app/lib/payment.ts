import { activatePremium } from "./premium";

export const PRICING = {
  amount: 1900,          // in paise → ₹19
  currency: "INR",
  name: "Resuman Premium",
  description: "Unlock AI Résumé Auto-Optimization",
  color: "#4A4535",
};

/** Dynamically load the Razorpay script */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface PaymentCallbacks {
  onSuccess: (paymentId: string) => void;
  onFailure: (reason: string) => void;
  onDismiss: () => void;
}

/**
 * Open Razorpay checkout.
 * NOTE: In production, `order_id` should be generated server-side.
 * For this MVP, we use a client-side Razorpay "key_id only" flow (test mode).
 */
export async function initiatePayment(
  razorpayKeyId: string,
  userEmail: string,
  userName: string,
  callbacks: PaymentCallbacks
): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    callbacks.onFailure("Failed to load payment gateway. Check your internet connection.");
    return;
  }

  const options = {
    key: razorpayKeyId,
    amount: PRICING.amount,
    currency: PRICING.currency,
    name: PRICING.name,
    description: PRICING.description,
    image: "",
    prefill: {
      name: userName || "Resuman User",
      email: userEmail || "",
    },
    theme: { color: PRICING.color },
    handler: async (response: { razorpay_payment_id: string; razorpay_signature?: string }) => {
      try {
        // Store payment ID and activate premium in Firestore
        await activatePremium(response.razorpay_payment_id);
        callbacks.onSuccess(response.razorpay_payment_id);
      } catch (err) {
        callbacks.onFailure("Payment succeeded but activation failed. Please contact support.");
      }
    },
    modal: {
      ondismiss: () => callbacks.onDismiss(),
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on("payment.failed", (response: { error: { description: string } }) => {
    callbacks.onFailure(response.error.description || "Payment failed.");
  });
  rzp.open();
}
