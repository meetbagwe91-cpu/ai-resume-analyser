import { activatePremium } from "./premium";

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
 * Now uses secure server-side order creation and signature verification.
 */
export async function initiatePayment(
  razorpayKeyId: string,
  packageId: string,
  userEmail: string,
  userName: string,
  callbacks: PaymentCallbacks
): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    callbacks.onFailure("Failed to load payment gateway. Check your internet connection.");
    return;
  }

  try {
    // 1. Create order on the server
    const orderRes = await fetch("/api/create-order", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId })
    });
    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      throw new Error(errorData.error || "Failed to create order");
    }
    const orderData = await orderRes.json();

    let name = "Resumate Premium";
    let desc = "Premium Features";
    if (packageId === "auto-optimize") { desc = "Pro (2 uses)"; }
    else if (packageId === "build-ai") { desc = "Pro Build (2 uses)"; }
    else if (packageId === "bundle") { desc = "Pro + Build (4 uses total)"; }

    // 2. Open Razorpay Checkout
    const options = {
      key: razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.order_id,
      name: name,
      description: desc,
      image: "",
      prefill: {
        name: userName || "Resumate User",
        email: userEmail || "",
      },
      theme: { color: "#4A4535" },
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        try {
          // 3. Verify signature on the server
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed");
          }

          // 4. Store payment ID and activate premium in Firestore from client
          await activatePremium(response.razorpay_payment_id, packageId);
          callbacks.onSuccess(response.razorpay_payment_id);
        } catch (err: any) {
          callbacks.onFailure(err.message || "Payment succeeded but activation failed. Please contact support.");
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
  } catch (err: any) {
    callbacks.onFailure(err.message || "An unexpected error occurred during checkout initialization.");
  }
}
