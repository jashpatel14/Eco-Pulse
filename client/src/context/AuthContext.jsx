import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data.user);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (loginId, password) => {
    const { data } = await api.post("/auth/login", { loginId, password });
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
