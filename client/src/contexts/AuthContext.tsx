import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem("authToken", data.token);
    } catch (error) {
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
      throw error;
    }
  };

  const logout = async () => {
    // Call logout endpoint to invalidate server-side session
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore errors, we're logging out anyway
        console.error("Logout error:", error);
      }
    }
    
    // Clear local state
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

