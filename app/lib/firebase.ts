import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// All values come from VITE_* environment variables.
// For local dev: copy .env.example → .env and fill in your values.
// For Vercel / Render / Railway: add the same vars in the dashboard.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     as string,
};

// Guard: catch missing vars immediately in dev so the error is obvious
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => `VITE_FIREBASE_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);
if (missing.length) {
  throw new Error(`Missing env vars:\n  ${missing.join("\n  ")}\nAdd them to your .env file.`);
}

// Prevent duplicate app error during HMR / SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db             = getFirestore(app);
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage        = getStorage(app);
