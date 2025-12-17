"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType); // ✅ FIXED HERE

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("fiscalcare_token") || localStorage.getItem("token");
    const storedUser = localStorage.getItem("fiscalcare_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const mockToken = `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockUser = { email, name: email.split("@")[0] };

      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem("fiscalcare_token", mockToken);
      localStorage.setItem("fiscalcare_user", JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fiscalcare_token");
    localStorage.removeItem("fiscalcare_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
