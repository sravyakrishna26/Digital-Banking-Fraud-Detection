import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isAuthenticated, logout as authLogout } from "@/services/authApi";

interface AuthContextType {
  authenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication status on mount
    setAuthenticated(isAuthenticated());
  }, []);

  const logout = () => {
    authLogout();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, logout }}>
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