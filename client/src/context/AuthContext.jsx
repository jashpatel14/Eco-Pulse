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

  // Expose logout function globally for api config to call when refresh fails
  window.triggerLogout = () => {
    setUser(null);
    setApiToken(null);
  };

  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const authenticateWithToken = (token) => {
    setApiToken(token);
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({ id: decoded.id, name: decoded.name, email: decoded.email });
    }
  };

  // On initial mount, attempt to silently refresh token via HttpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        authenticateWithToken(data.token);
      } catch (error) {
        // Silent fail is expected if no cookie exists or it's invalid
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    authenticateWithToken(token);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
  };

  const verifyEmail = async (token) => {
    // Calling the updated GET endpoint with token as a URL param
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // API failure on logout is non-critical, proceed with local logout
    }
    window.triggerLogout();
  };

  const forgotPassword = async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  };

  const resetPassword = async (sessionId, password) => {
    // Both session and new password in request body
    const response = await api.post(`/auth/reset-password`, { token: sessionId, password });
    return response.data;
  };

  const getProfile = async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post("/auth/change-password", { currentPassword, newPassword });
    return response.data;
  };

  const deleteAccount = async () => {
    const response = await api.delete("/auth/account");
    return response.data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    changePassword,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
