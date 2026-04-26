import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isNewUser, setIsNewUser]     = useState(false); // triggers onboarding

  // Provision user with backend after every login
  async function provision(token) {
    try {
      await fetch(
        "https://backend-production-88273.up.railway.app/auth/provision",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (e) {
      console.warn("Provision failed:", e);
    }
  }

  function sessionToUser(session) {
    if (!session) return null;
    return {
      userId:      session.user.id,
      accessToken: session.access_token,
      email:       session.user.email,
    };
  }

  // Sync session to Chrome extension storage so Google login works in extension
  function syncToExtension(session) {
    if (!session) return;
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({
          userId:       session.user.id,
          accessToken:  session.access_token,
          refreshToken: session.refresh_token,
          tokenExpiry:  Date.now() + (session.expires_in || 3600) * 1000,
        });
      }
    } catch {
      // Extension not installed — ignore
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = sessionToUser(session);
      setUser(u);
      if (u) {
        provision(u.accessToken);
        syncToExtension(session);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const u = sessionToUser(session);
      setUser(u);

      if (u && session) {
        provision(u.accessToken);
        syncToExtension(session);
      }

      // Trigger onboarding for new Google OAuth users
      // SIGNED_IN after a SOCIAL provider = new or returning Google user
      // We use user.created_at to detect if this is truly a new signup
      if (event === "SIGNED_IN" && session?.user) {
        const createdAt  = new Date(session.user.created_at).getTime();
        const now        = Date.now();
        const ageSeconds = (now - createdAt) / 1000;
        // If account was created in last 30 seconds = new user
        if (ageSeconds < 30) {
          setIsNewUser(true);
        }
      }

      // Clear extension storage on logout
      if (event === "SIGNED_OUT") {
        try {
          if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.remove([
              "userId", "accessToken", "refreshToken", "tokenExpiry",
            ]);
          }
        } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return sessionToUser(data.session);
  };

  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    // data.session is null when email confirmation is required
    // Return null so Login.jsx knows to show "check your email"
    return data.session ? sessionToUser(data.session) : null;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://focusos-dashboard.vercel.app" },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsNewUser(false);
  };

  const clearNewUser = () => setIsNewUser(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isNewUser,
        clearNewUser,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
