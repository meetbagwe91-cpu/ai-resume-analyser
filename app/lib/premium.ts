import { db } from "./firebase";
import { auth } from "./firebase";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc, increment } from "firebase/firestore";

export interface PremiumStatus {
  isPremium: boolean;
  optimizationCredits: number;
  buildCredits: number;
  paymentId?: string;
  activatedAt?: string;
  plan?: string;
}

const DEFAULT_STATUS: PremiumStatus = {
  isPremium: false,
  optimizationCredits: 0,
  buildCredits: 0,
};

/** Read premium status from Firestore */
export async function checkPremiumStatus(): Promise<PremiumStatus> {
  try {
    const user = auth.currentUser;
    if (!user) return DEFAULT_STATUS;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.premiumStatus) {
        return {
          ...DEFAULT_STATUS,
          ...data.premiumStatus
        };
      }
    }
    return DEFAULT_STATUS;
  } catch (e) {
    console.error("Error reading premium status:", e);
    return DEFAULT_STATUS;
  }
}

/** Write premium flag to Firestore after successful payment */
export async function activatePremium(paymentId: string, packageId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  let optCredits = 0;
  let bldCredits = 0;

  if (packageId === "auto-optimize") {
    optCredits = 2;
  } else if (packageId === "build-ai") {
    bldCredits = 2;
  } else if (packageId === "bundle") {
    optCredits = 2;
    bldCredits = 2;
  } else {
    throw new Error("Invalid package ID");
  }

  const statusUpdate = {
    isPremium: true,
    paymentId,
    activatedAt: new Date().toISOString(),
    plan: packageId,
    optimizationCredits: increment(optCredits),
    buildCredits: increment(bldCredits),
  };

  // Save to users collection
  await setDoc(doc(db, "users", user.uid), { premiumStatus: statusUpdate }, { merge: true });

  // Record payment history
  await addDoc(collection(db, "payments"), {
    userId: user.uid,
    packageId,
    optCreditsAdded: optCredits,
    bldCreditsAdded: bldCredits,
    paymentId,
    createdAt: new Date().toISOString(),
  });
}

/** Decrement an optimization credit */
export async function useOptimizationCredit(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  const status = await checkPremiumStatus();
  if (status.optimizationCredits <= 0) return false;

  await setDoc(doc(db, "users", user.uid), { 
    premiumStatus: { optimizationCredits: increment(-1) } 
  }, { merge: true });
  
  return true;
}

/** Decrement a build credit */
export async function useBuildCredit(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  const status = await checkPremiumStatus();
  if (status.buildCredits <= 0) return false;

  await setDoc(doc(db, "users", user.uid), { 
    premiumStatus: { buildCredits: increment(-1) } 
  }, { merge: true });
  
  return true;
}

/** Quick boolean check */
export async function isPremiumUser(): Promise<boolean> {
  const s = await checkPremiumStatus();
  return s.isPremium;
}
