"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("tripnest_admin_token");
      const storedUser = localStorage.getItem("tripnest_admin_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error reading stored admin auth:", e);
    } finally {
      setIsLoading(false);
    }

    const handleTokenRefreshed = (e) => {
      if (e.detail) {
        setToken(e.detail);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("tripnest_admin_token_refreshed", handleTokenRefreshed);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("tripnest_admin_token_refreshed", handleTokenRefreshed);
      }
    };
  }, []);

  const login = async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    const authData = res.data || res;
    const userData = authData.user;
    const accessToken = authData.accessToken;
    const refreshToken = authData.refreshToken;

    if (!["SUPER_ADMIN", "HOTEL_ADMIN", "TRIP_MANAGER"].includes(userData.role)) {
      throw new Error("Access denied. This portal is for administrative personnel only.");
    }

    setToken(accessToken);
    setUser(userData);
    localStorage.setItem("tripnest_admin_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("tripnest_admin_refresh_token", refreshToken);
    }
    localStorage.setItem("tripnest_admin_user", JSON.stringify(userData));
    return userData;
  };

  const registerAdmin = async (formData) => {
    const res = await authApi.registerAdmin(formData);
    const authData = res.data || res;
    const userData = authData.user;
    const accessToken = authData.accessToken;
    const refreshToken = authData.refreshToken;

    setToken(accessToken);
    setUser(userData);
    localStorage.setItem("tripnest_admin_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("tripnest_admin_refresh_token", refreshToken);
    }
    localStorage.setItem("tripnest_admin_user", JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("tripnest_admin_token");
    localStorage.removeItem("tripnest_admin_refresh_token");
    localStorage.removeItem("tripnest_admin_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        registerAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
