import { db } from "./firebase";
import { auth } from "./firebase";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";

export interface PremiumStatus {
  isPremium: boolean;
  paymentId?: string;
  activatedAt?: string;
  plan?: string;
}

/** Read premium status from Firestore */
export async function checkPremiumStatus(): Promise<PremiumStatus> {
  try {
    const user = auth.currentUser;
    if (!user) return { isPremium: false };

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.premiumStatus) return data.premiumStatus;
    }
    return { isPremium: false };
  } catch (e) {
    console.error("Error reading premium status:", e);
    return { isPremium: false };
  }
}

/** Write premium flag to Firestore after successful payment */
export async function activatePremium(paymentId: string, plan = "one-time"): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const status: PremiumStatus = {
    isPremium: true,
    paymentId,
    activatedAt: new Date().toISOString(),
    plan,
  };

  // Save to users collection
  await setDoc(doc(db, "users", user.uid), { premiumStatus: status }, { merge: true });

  // Record payment history
  await addDoc(collection(db, "payments"), {
    userId: user.uid,
    ...status
  });
}

/** Quick boolean check */
export async function isPremiumUser(): Promise<boolean> {
  const s = await checkPremiumStatus();
  return s.isPremium;
}
