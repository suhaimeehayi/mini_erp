/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { refreshAccessTokenService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  const isTokenExpiringSoon = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Check if token expires in less than 5 minutes
      return payload.exp - currentTime < 300;
    } catch {
      return false;
    }
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/accounts/profiles/me/');
      setUser(response.data);
      // Extract permissions from role
      if (response.data.role) {
        const rolePermissions = response.data.role.permissions || [];
        setPermissions(rolePermissions.map(p => p.codename));
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      await refreshAccessTokenService();
      setIsAuthenticated(true);
      await fetchUserProfile();
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
    }
  }, [logout, fetchUserProfile]);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem("access");
      if (token) {
        if (isTokenExpired(token)) {
          logout();
        } else if (isTokenExpiringSoon(token)) {
          await refreshAccessToken();
        } else {
          setIsAuthenticated(true);
          await fetchUserProfile();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    checkAndRefreshToken();

    // Set up interval to check token every minute
    const interval = setInterval(() => {
      const token = localStorage.getItem("access");
      if (token && isTokenExpiringSoon(token)) {
        refreshAccessToken();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [logout, refreshAccessToken, fetchUserProfile]);

  const login = (tokens) => {
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    setIsAuthenticated(true);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const isAdmin = () => {
    return user?.role?.name === 'Admin' || user?.is_staff;
  };

  const isManager = () => {
    return user?.role?.name === 'Manager' || user?.is_staff;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      permissions,
      login,
      logout,
      loading,
      hasPermission,
      isAdmin,
      isManager,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};