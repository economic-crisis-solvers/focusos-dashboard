import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, accessToken, email }
  const [loading, setLoading] = useState(true);

  // Provision user with backend after every login
  async function provision(token) {
    try {
      await fetch(
        "https://backend-production-88273.up.railway.app/auth/provision",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (e) {
      console.warn("Provision failed:", e);
    }
  }

  function sessionToUser(session) {
    if (!session) return null;
    return {
      userId: session.user.id,
      accessToken: session.access_token,
      email: session.user.email,
    };
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = sessionToUser(session);
      setUser(u);
      if (u) provision(u.accessToken);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = sessionToUser(session);
      setUser(u);
      if (u) provision(u.accessToken);
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
    return sessionToUser(data.session);
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
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, loginWithGoogle, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
