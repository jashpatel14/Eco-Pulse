import { createContext, useContext, useState, useEffect } from "react";
import api, { setToken as setApiToken } from "../api/api";

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
      const token = localStorage.getItem("token");
      if (token) {
        setApiToken(token);
        try {
          const { data } = await api.get("/auth/profile");
          setUser(data.user);
        } catch (err) {
          localStorage.removeItem("token");
          setApiToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (loginId, password) => {
    const { data } = await api.post("/auth/login", { loginId, password });
    localStorage.setItem("token", data.token);
    setApiToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setApiToken(null);
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
