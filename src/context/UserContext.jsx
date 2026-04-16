/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserProfileApi } from "../services/api";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;

  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await getUserProfileApi();
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      setUser(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // 🔁 Fetch once after login
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,               // useful after profile update
        profileLoading,
        refreshUserProfile: fetchUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return ctx;
};
