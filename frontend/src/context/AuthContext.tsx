import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";

export type Role = "Admin" | "Officer" | "Farmer";

interface User {
  id: number;
  email: string;
  role: Role;
  profilePicture?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateProfilePicture: (url: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("asac_token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      // In a real implementation, we would verify the token with the backend here.
      // For now, we decode it locally or wait for the backend to provide /me.
      // We'll simulate a fetch for the /me endpoint.
      axios.get("http://localhost:8800/api/auth/me")
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          // Token might be invalid
          localStorage.removeItem("asac_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("asac_token", newToken);
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem("asac_token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateProfilePicture = (url: string | null) => {
    setUser((prev) => (prev ? { ...prev, profilePicture: url } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateProfilePicture, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
