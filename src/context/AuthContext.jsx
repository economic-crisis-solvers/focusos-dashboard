import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, accessToken, email }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('focusos_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    const u = { userId: data.userId, accessToken: data.accessToken, email };
    localStorage.setItem('focusos_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (email, name, password) => {
    const data = await api.register(email, name, password);
    const u = { userId: data.userId, accessToken: data.accessToken, email };
    localStorage.setItem('focusos_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('focusos_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
