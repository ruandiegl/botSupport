import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string | null;
  isOnline?: boolean;
  isActive?: boolean;
  permissions?: {
    resources: Record<string, Record<string, boolean>>;
    screens: Record<string, boolean>;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  can: (resource: string, action: string) => boolean;
  canViewScreen: (path: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("gtfbot_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem("gtfbot_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(apiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          localStorage.removeItem("gtfbot_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao validar sessão:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Falha ao realizar login.");
    }

    localStorage.setItem("gtfbot_token", data.token);
    setToken(data.token);
    setUser({ ...data.agent, permissions: data.permissions });
  };

  const logout = () => {
    const storedToken = localStorage.getItem("gtfbot_token");
    if (storedToken) {
      fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${storedToken}` },
      }).catch(() => {});
    }

    localStorage.removeItem("gtfbot_token");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN";
  const can = (resource: string, action: string) => isAdmin || Boolean(user?.permissions?.resources[resource]?.[action]);
  const canViewScreen = (path: string) => isAdmin || Boolean(user?.permissions?.screens[path] || (path.startsWith("/conversation/") && user?.permissions?.screens["/conversation/:id"]));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin,
        isLoading,
        can,
        canViewScreen,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
