import { create } from "zustand";
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AppStore {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<User | null>;
  initAuth: () => void;
  clearError: () => void;
}

export const useAppStore = create<AppStore>((set, get) => {
  const setError = (msg: string) => set({ error: msg, isLoading: false });

  const signIn = async () => {
    set({ isLoading: true, error: null });
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      let errorMessage = "Invalid credentials. Please check your email and password.";
      if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/Password sign-in is not enabled. Please enable it in the Firebase Console.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (err.message) {
        errorMessage = err.message; // Fallback to raw message if uncaught
      }
      setError(errorMessage);
    }
  };

  const signOut = async () => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle unsetting the user
    } catch (err: any) {
      setError(err.message || "Sign out failed");
    }
  };

  const getUser = async (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  };

  let initialized = false;

  const initAuth = () => {
    if (initialized) return;
    initialized = true;

    set({ isLoading: true });
    
    // Check for redirect errors
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect sign-in error:", err);
      set({ error: err.message || "Authentication failed during redirect" });
    });

    onAuthStateChanged(auth, (user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });
  };

  return {
    isLoading: true,
    error: null,
    user: null,
    isAuthenticated: false,
    signIn,
    loginWithEmail,
    signOut,
    getUser,
    initAuth,
    clearError: () => set({ error: null }),
  };
});
