/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session ONCE on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const onboarded = localStorage.getItem("onboarded") === "1";

    if (storedToken) {
      setToken(storedToken);
      setIsOnboarded(onboarded);
    }

    setIsLoading(false);
  }, []);

  /**
   * Login / set token
   * meta.onboarded === true  → user finished onboarding
   * meta.onboarded === false → user still onboarding
   */
  const login = (newToken, meta = {}) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);

    const onboarded = !!meta.onboarded;
    localStorage.setItem("onboarded", onboarded ? "1" : "0");
    setIsOnboarded(onboarded);
  };

  const markOnboarded = () => {
    localStorage.setItem("onboarded", "1");
    setIsOnboarded(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("onboarded");
    setToken(null);
    setIsOnboarded(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isOnboarded,
        login,
        markOnboarded,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
