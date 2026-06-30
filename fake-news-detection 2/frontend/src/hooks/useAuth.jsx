import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "veritas_access_token";

/**
 * AuthProvider owns the current user + JWT token state for the whole
 * app. The token is persisted to localStorage so a page refresh
 * doesn't log the user out; on mount, we re-validate it against
 * GET /api/auth/me and clear it if it's expired or invalid.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async (activeToken) => {
    try {
      const response = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setUser(response.data);
    } catch (err) {
      // Token expired/invalid — clear it so the user is redirected to login.
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { access_token } = response.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
    setToken(access_token);
    await fetchCurrentUser(access_token);
    return response.data;
  };

  const register = async (email, password, fullName) => {
    await api.post("/api/auth/register", {
      email,
      password,
      full_name: fullName || null,
    });
    // Registration succeeded — log the user straight in for a smoother flow.
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
