import { create } from "zustand";
import {
  type User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AppStore {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<boolean>;
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
    } catch (err: any) {
      if (err.code === "auth/cancelled-popup-request" || err.code === "auth/popup-closed-by-user") {
        set({ isLoading: false });
        return;
      }
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
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName });
      }
    } catch (err: any) {
      let errorMessage = "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    set({ error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      let errorMessage = "Failed to send reset email.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return false;
    }
  };

  const signOut = async () => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      setError(err.message || "Sign out failed");
    }
  };

  const deleteAccount = async (password?: string): Promise<boolean> => {
    const user = get().user;
    if (!user) return false;
    set({ isLoading: true, error: null });
    try {
      // Re-authenticate if email provider
      if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }
      await deleteUser(user);
      set({ user: null, isAuthenticated: false, isLoading: false });
      return true;
    } catch (err: any) {
      let errorMessage = "Failed to delete account.";
      if (err.code === "auth/requires-recent-login") {
        errorMessage = "Please sign out and sign back in before deleting your account.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return false;
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
    signUpWithEmail,
    sendPasswordReset,
    signOut,
    deleteAccount,
    getUser,
    initAuth,
    clearError: () => set({ error: null }),
  };
});

