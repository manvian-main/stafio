import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { saveSession, getCurrentSession, logoutCurrentTab } from "../utils/sessionManager";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getCurrentSession());

  const login = useCallback((userData, role) => {
    saveSession(userData, role);
    setSession(getCurrentSession());
  }, []);

  const logout = useCallback(() => {
    logoutCurrentTab();
    setSession(null);
  }, []);

  const refresh = useCallback(() => {
    setSession(getCurrentSession());
  }, []);

  const value = useMemo(
    () => ({
      user: session,
      role: session?.role || null,
      isAuthenticated: !!session,
      login,
      logout,
      refresh,
    }),
    [session, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
