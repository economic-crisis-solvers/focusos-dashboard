import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Extension ID — needed for chrome.runtime.sendMessage from a webpage.
// This is the ID of the unpacked extension (visible in chrome://extensions).
// When published to Chrome Web Store, this becomes a fixed ID.
// For now we try to send and catch any errors silently.
const EXTENSION_ID = "gnmihpaapkgoickabmepllmgbadngfkh"; // FocusOS extension ID from chrome://extensions

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  async function provision(token) {
    try {
      await fetch(
        "https://backend-production-88273.up.railway.app/auth/provision",
        {
          method:  "POST",
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

  // Send token to Chrome extension via chrome.runtime.sendMessage.
  // This is the correct cross-origin method — chrome.storage.local is sandboxed
  // and cannot be written to by a webpage directly.
  async function syncToExtension(session) {
    if (!session) return;
    if (typeof chrome === "undefined" || !chrome.runtime) return;

    const payload = {
      type:         "FOCUSOS_AUTH_TOKEN",
      userId:       session.user.id,
      accessToken:  session.access_token,
      refreshToken: session.refresh_token,
      tokenExpiry:  Date.now() + (session.expires_in || 3600) * 1000,
    };

    try {
      if (EXTENSION_ID) {
        // Send to specific extension ID (more reliable)
        chrome.runtime.sendMessage(EXTENSION_ID, payload, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("[FocusOS] Extension message failed:", chrome.runtime.lastError.message);
          } else {
            console.log("[FocusOS] Token synced to extension:", response);
          }
        });
      } else {
        // Send without ID — works if the dashboard is listed in externally_connectable
        // and the extension is installed. Chrome will route it to the right extension.
        chrome.runtime.sendMessage(payload, (response) => {
          if (chrome.runtime.lastError) {
            // Extension not installed or not connectable — ignore silently
          } else {
            console.log("[FocusOS] Token synced to extension:", response);
          }
        });
      }
    } catch {
      // Extension not installed — ignore
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = sessionToUser(session);
      setUser(u);
      if (u && session) {
        provision(u.accessToken);
        syncToExtension(session);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const u = sessionToUser(session);
      setUser(u);

      if (u && session) {
        provision(u.accessToken);
        syncToExtension(session);
      }

      // Detect new Google user (account created in last 30 seconds)
      if (event === "SIGNED_IN" && session?.user) {
        const ageSeconds = (Date.now() - new Date(session.user.created_at).getTime()) / 1000;
        if (ageSeconds < 30) {
          setIsNewUser(true);
        }
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsNewUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
    return data.session ? sessionToUser(data.session) : null;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: "https://focusos-dashboard.vercel.app" },
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
      value={{ user, loading, isNewUser, clearNewUser, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
