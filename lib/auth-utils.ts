"use client";

// Client-side authentication utilities
export const getAuthTokens = () => {
  if (typeof window === "undefined") return { accessToken: null, sessionToken: null };
  
  return {
    accessToken: localStorage.getItem("accessToken") || null,
    sessionToken: localStorage.getItem("sessionToken") || null
  };
};

export const setAuthTokens = (accessToken: string, sessionToken: string) => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("sessionToken", sessionToken);
  
  // Also set a flag to indicate the user is logged in
  localStorage.setItem("isLoggedIn", "true");
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("accessToken");
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("isLoggedIn");
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  
  const { accessToken, sessionToken } = getAuthTokens();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  return !!accessToken && !!sessionToken && isLoggedIn;
}; 