import { create } from "zustand";
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AppStore {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
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
    signOut,
    getUser,
    initAuth,
    clearError: () => set({ error: null }),
  };
});
