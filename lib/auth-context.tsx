"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuthTokens, setAuthTokens, clearAuthTokens, isAuthenticated } from "./auth-utils"
import { getCurrentUser } from "@/app/(auth)/me/action"
import { refreshToken } from "@/app/(auth)/refresh/action"
import { logout } from "@/app/(auth)/logout/action"

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  getAccessToken: () => string | null
  logout: () => Promise<void>
  refreshAuthState: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  getAccessToken: () => null,
  logout: async () => {},
  refreshAuthState: async () => {},
})

// Define paths that don't require authentication
const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password']

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      if (typeof window === "undefined") return
      
      // First check if we have tokens in localStorage
      if (!isAuthenticated()) {
        setUser(null)
        setIsLoading(false)
        return
      }
      
      const { accessToken } = getAuthTokens()

      // Try to get the current user
      const result = await getCurrentUser(accessToken)
      
      if (result.error) {
        // Try to refresh the token
        const refreshResult = await refreshToken()
        
        if ('error' in refreshResult) {
          clearAuthTokens()
          setUser(null)
        } else {
          // Store the new access token
          setAuthTokens(refreshResult.accessToken, refreshResult.sessionToken)
          
          // Try again with the new access token
          const retryResult = await getCurrentUser(refreshResult.accessToken)
          
          if (retryResult.error) {
            clearAuthTokens()
            setUser(null)
          } else if (retryResult.user) {
            setUser(retryResult.user)
          }
        }
      } else if (result.user) {
        setUser(result.user)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      clearAuthTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is authenticated on mount and when pathname changes
  useEffect(() => {
    checkAuth()
  }, [pathname])

  // Also set up a periodic check for authentication status
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        checkAuth()
      }
    }, 5 * 60 * 1000) // Check every 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  const getAccessToken = () => {
    const { accessToken } = getAuthTokens()
    return accessToken
  }

  const handleLogout = async () => {
    try {
      // Call the logout server action
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear client-side tokens
      clearAuthTokens()
      setUser(null)
      
      // Redirect to home page instead of login
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        getAccessToken,
        logout: handleLogout,
        refreshAuthState: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

